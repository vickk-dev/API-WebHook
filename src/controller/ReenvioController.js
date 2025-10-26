const { ReenviarService } = require('../services/ReenviarServices');

async function reenviarController(req, res) {
    //Chama o serviço de reenvio dentro de um bloco try
  try {
    const data = req.body;

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
