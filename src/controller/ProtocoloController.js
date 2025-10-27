const ProtocoloService = require('../services/ProtocoloService');

/**
 * Controller para listagem de protocolos
 * GET /protocolo
 */
async function listarProtocolosController(req, res) {
  try {
    // Os parâmetros já foram validados pelo middleware
    const { start_date, end_date, product, id, kind, type } = req.query;

    const filtros = {
      start_date,
      end_date,
      ...(product && { product }),
      ...(id && { id }),
      ...(kind && { kind }),
      ...(type && { type })
    };

    const protocolos = await ProtocoloService.listarProtocolos(filtros);

    return res.status(200).json({
      success: true,
      total: protocolos.length,
      filtros: {
        start_date,
        end_date,
        ...(product && { product }),
        ...(id && { id }),
        ...(kind && { kind }),
        ...(type && { type })
      },
      data: protocolos
    });

  } catch (error) {
    console.error('[ProtocoloController] Erro ao listar protocolos:', error);

    const status = error.status || 500;
    const message = error.message || 'Erro ao buscar protocolos. Tente novamente mais tarde.';

    return res.status(status).json({
      error: true,
      message
    });
  }
}

/**
 * Controller para consulta individual de protocolo
 * GET /protocolo/:uuid
 */
async function consultarProtocoloController(req, res) {
  try {
    // O UUID já foi validado pelo middleware
    const { uuid } = req.params;

    const protocolo = await ProtocoloService.consultarProtocolo(uuid);

    return res.status(200).json({
      success: true,
      data: protocolo
    });

  } catch (error) {
    console.error('[ProtocoloController] Erro ao consultar protocolo:', error);

    const status = error.status || 500;
    const message = error.message || 'Erro ao buscar protocolo. Tente novamente mais tarde.';

    return res.status(status).json({
      error: true,
      message
    });
  }
}

module.exports = {
  listarProtocolosController,
  consultarProtocoloController
};
