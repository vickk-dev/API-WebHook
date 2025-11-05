const { ReenviarService } = require('../services/ReenviarServices');

async function reenviarController(req, res) {
  try {
    // log da request body e dos dados injetados pelo middleware
    console.log('[ReenvioController] body recebido:', req.body);
    console.log('[ReenvioController] req.cedente:', req.cedente ? {
      id: req.cedente.id,
      cnpj: req.cedente.cnpj,
      token: req.cedente.token,
      softwarehouse_id: req.cedente.softwarehouse_id
    } : null);
    console.log('[ReenvioController] req.softwareHouse:', req.softwareHouse ? {
      id: req.softwareHouse.id,
      cnpj: req.softwareHouse.cnpj
    } : null);

    // Garanta que o serviço receba o cedente_id (e opcionalmente softwarehouse_id)
    const data = {
      ...req.body,
      cedente_id: req.cedente ? req.cedente.id : null,
      softwarehouse_id: req.softwareHouse ? req.softwareHouse.id : null
    };

    // debug antes de chamar o serviço
    console.log('[ReenvioController] dados enviados ao ReenviarService:', data);

    const resultado = await ReenviarService(data);

    return res.status(201).json({
      message: resultado.message,
      protocolo: resultado.protocolo,
      uuid: resultado.uuid,
    });

  } catch (error) {
    console.error('[ReenvioController] Erro no processamento:', error);

    const status = error.status || 400;
    const message = error.message || 'Não foi possível gerar a notificação. Tente novamente mais tarde.';

    return res.status(status).json({
      error: true,
      message,
      ...(error.idsInvalidos && { idsInvalidos: error.idsInvalidos }),
    });
  }
}

module.exports = { reenviarController };
