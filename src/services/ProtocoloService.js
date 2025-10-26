const { Servico, WebhookReprocessado } = require('../Infrastructure/Persistence/Sequelize/models');
const { Op } = require('sequelize');

const cache = {};

class ProtocoloService {
  
  static async listarProtocolos(filtros = {}) {
    const { dataInicio, dataFim, status } = filtros;

    if (dataInicio && dataFim) {
      const inicio = new Date(dataInicio);
      const fim = new Date(dataFim);
      const diffMs = fim - inicio;
      const diffDias = diffMs / (1000 * 60 * 60 * 24);

      if (diffDias > 31) {
        throw new Error('O intervalo entre dataInicio e dataFim não pode ser maior que 31 dias.');
      }
    }

    const cacheKey = JSON.stringify(filtros);
    if (cache[cacheKey]) {
      return cache[cacheKey];
    }

    const whereServico = {};
    if (status) whereServico.status = status;
    if (dataInicio && dataFim) {
      whereServico.data_criacao = {
        [Op.between]: [new Date(dataInicio), new Date(dataFim)]
      };
    }

    const servicos = await Servico.findAll({
      where: whereServico,
      include: [{ association: 'convenio' }]
    });

    const servicoIds = servicos.map(s => s.id);
    const webhooks = await WebhookReprocessado.findAll({
      where: {
        servico_id: servicoIds.length ? JSON.stringify(servicoIds) : null,
        ...(dataInicio && dataFim ? {
          data_criacao: {
            [Op.between]: [new Date(dataInicio), new Date(dataFim)]
          }
        } : {})
      },
      include: ['cedente']
    });

    const resultado = webhooks.map(w => ({
      id: w.id,
      protocolo: w.protocolo,
      servico_id: w.servico_id,
      cedente_id: w.cedente_id,
      data_criacao: w.data_criacao
    }));

    cache[cacheKey] = resultado;

    return resultado;
  }

  /**
      @param {string} uuid
     */
    static async consultarProtocolo(uuid) {
        const cacheKey = `protocolo:${uuid}`;

        if (cache[cacheKey]) {
            return cache[cacheKey];
        }

        const protocolo = await WebhookReprocessado.findByPk(uuid, {
            include: ['cedente'] 
        });

        if (!protocolo) {
            const error = new Error("Protocolo não encontrado.");
            error.status = 400; 
            throw error;
        }

        const dadosProtocolo = protocolo.toJSON();
        
        const statusNotificacao = dadosProtocolo.status; 
        
        if (statusNotificacao === 'sent') {
            cache[cacheKey] = dadosProtocolo; 
        }

        return dadosProtocolo;
    }
  
}

module.exports = ProtocoloService;
