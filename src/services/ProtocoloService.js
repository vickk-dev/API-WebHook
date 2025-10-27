const { WebhookReprocessado } = require('../Infrastructure/Persistence/Sequelize/models');
const { Op } = require('sequelize');
const CacheService = require('./CacheService');
const crypto = require('crypto');

class ProtocoloService {
  
  /**
   * Lista protocolos com filtros
   * @param {Object} filtros - Filtros de busca
   * @param {Date} filtros.start_date - Data inicial (obrigatório)
   * @param {Date} filtros.end_date - Data final (obrigatório)
   * @param {string} filtros.product - Produto (opcional: boleto, pagamento, pix)
   * @param {Array<string>} filtros.id - Array de IDs (opcional)
   * @param {string} filtros.kind - Tipo de notificação (opcional: webhook, evento, agendamento)
   * @param {string} filtros.type - Situação (opcional: disponivel, cancelado, pago)
   * @returns {Array} Lista de protocolos
   */
  static async listarProtocolos(filtros = {}) {
    const { start_date, end_date, product, id, kind, type } = filtros;

    // Gera chave de cache baseada nos filtros
    const cacheKey = `protocolos:list:${crypto.createHash('md5').update(JSON.stringify(filtros)).digest('hex')}`;
    
    // Verifica se existe no cache (TTL: 1 dia = 86400 segundos)
    const cachedData = await CacheService.get(cacheKey);
    if (cachedData) {
      console.log('Retornando dados do cache Redis');
      return cachedData;
    }

    // Monta a query de busca
    const whereClause = {};

    // Filtros obrigatórios de data
    if (start_date && end_date) {
      whereClause.data_criacao = {
        [Op.between]: [new Date(start_date), new Date(end_date)]
      };
    }

    // Filtros opcionais
    if (product) {
      // Buscar no campo 'data' que armazena o JSON da requisição original
      whereClause['data.product'] = product;
    }

    if (kind) {
      whereClause.kind = kind;
    }

    if (type) {
      whereClause.type = type;
    }

    // Filtro de IDs (pode ser um array)
    if (id) {
      const idsArray = Array.isArray(id) ? id : [id];
      // O servico_id é armazenado como JSON string, então precisamos buscar aqueles que contém os IDs
      whereClause.servico_id = {
        [Op.or]: idsArray.map(idValue => ({
          [Op.like]: `%${idValue}%`
        }))
      };
    }

    // Busca no banco de dados
    const protocolos = await WebhookReprocessado.findAll({
      where: whereClause,
      include: [{
        association: 'cedente',
        attributes: ['id', 'cnpj']
      }],
      order: [['data_criacao', 'DESC']]
    });

    // Formata o resultado
    const resultado = protocolos.map(protocolo => ({
      id: protocolo.id,
      protocolo: protocolo.protocolo,
      kind: protocolo.kind,
      type: protocolo.type,
      product: protocolo.data?.product,
      servico_ids: protocolo.servico_id,
      cedente_id: protocolo.cedente_id,
      cedente_cnpj: protocolo.cedente?.cnpj,
      data_criacao: protocolo.data_criacao
    }));

    // Armazena no cache por 1 dia (86400 segundos)
    await CacheService.set(cacheKey, resultado, 86400);

    return resultado;
  }

  /**
   * Consulta um protocolo específico por UUID
   * @param {string} uuid - UUID do protocolo
   * @returns {Object} Dados do protocolo
   */
  static async consultarProtocolo(uuid) {
    const cacheKey = `protocolo:individual:${uuid}`;

    // Verifica se existe no cache
    const cachedData = await CacheService.get(cacheKey);
    if (cachedData) {
      console.log('Retornando protocolo do cache Redis');
      return cachedData;
    }

    // Busca no banco de dados
    const protocolo = await WebhookReprocessado.findByPk(uuid, {
      include: [{
        association: 'cedente',
        attributes: ['id', 'cnpj', 'status']
      }]
    });

    if (!protocolo) {
      const error = new Error("Protocolo não encontrado.");
      error.status = 400;
      throw error;
    }

    // Converte para objeto JSON
    const dadosProtocolo = {
      id: protocolo.id,
      protocolo: protocolo.protocolo,
      kind: protocolo.kind,
      type: protocolo.type,
      product: protocolo.data?.product,
      servico_ids: protocolo.servico_id,
      cedente_id: protocolo.cedente_id,
      cedente: {
        id: protocolo.cedente?.id,
        cnpj: protocolo.cedente?.cnpj,
        status: protocolo.cedente?.status
      },
      data_requisicao: protocolo.data,
      data_criacao: protocolo.data_criacao,
      status: protocolo.data?.status || 'sent' // Assumindo que o status vem no campo data
    };

    // Armazena no cache por 1 hora (3600 segundos) apenas se status = 'sent'
    if (dadosProtocolo.status === 'sent') {
      await CacheService.set(cacheKey, dadosProtocolo, 3600);
    }

    return dadosProtocolo;
  }
}

module.exports = ProtocoloService;
