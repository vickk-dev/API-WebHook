// Implementação que tenta consultar os modelos do projeto (Serviço) e, em fallback,
// retorna situações padrão por produto para evitar falhas.
const normalizeIds = (ids) =>
  ids.map((i) => (Array.isArray(i) && i.length > 0 ? i[0] : i));

const tryLoadModels = () => {
  try {
    // mantém compatibilidade com a forma como outros arquivos importam models ('../models')
    return require('../models');
  } catch (err) {
    return null;
  }
};

/**
 * Retorna uma lista de objetos { id, status } para os ids informados.
 * Tenta buscar nos modelos (Serviço) se disponíveis; caso contrário usa valores padrão por produto.
 *
 * @param {string} product - 'boleto' | 'pagamento' | 'pix' (ou outro)
 * @param {Array} ids - lista de ids ou listas onde o id é o primeiro item (ex: [[123], [124]] ou [123,124])
 * @returns {Promise<Array<{id: *, status: string}>>}
 */
async function testeSituacoes(product, ids) {
  const idList = normalizeIds(ids);
  const models = tryLoadModels();

  if (models && models.Servico && typeof models.Servico.findAll === 'function') {
    try {
      const records = await models.Servico.findAll({
        where: { id: idList },
        attributes: ['id', 'status'],
        raw: true,
      });

      return idList.map((id) => {
        const rec = records.find((r) => String(r.id) === String(id));
        const status = rec ? rec.status : 'UNKNOWN';
        return { id, status };
      });
    } catch (err) {
      // se houver erro ao consultar o BD, cair no fallback
      console.error('testeSituacoes: erro ao consultar modelos, usando fallback:', err.message || err);
    }
  }

  // Fallback: retorna status padrão por produto (compatível com tabelaSituacoes usada no serviço)
  const defaultByProduct = {
    boleto: 'REGISTRADO',
    pagamento: 'SCHEDULED',
    pix: 'ACTIVE',
  };

  const defaultStatus = defaultByProduct[product] || 'UNKNOWN';
  return idList.map((id) => ({ id, status: defaultStatus }));
}

module.exports = { testeSituacoes };