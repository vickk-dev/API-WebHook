// src/middleware/authMiddleware.js  (ou onde estiver)
const { SoftwareHouse, Cedente } = require('../../Infrastructure/Persistence/Sequelize/models');

async function authMiddleware(req, res, next) {
  try {
    // DEBUG: log dos headers recebidos
    console.log('[authMiddleware] headers recebidos:', {
      cnpjSh: req.headers['x-api-cnpj-sh'],
      tokenSh: req.headers['x-api-token-sh'],
      cnpjCedente: req.headers['x-api-cnpj-cedente'],
      tokenCedente: req.headers['x-api-token-cedente']
    });

    const unauthorizedError = { message: "Não autorizado" };

    const cnpjSh = req.headers['x-api-cnpj-sh'];
    const tokenSh = req.headers['x-api-token-sh'];
    const cnpjCedente = req.headers['x-api-cnpj-cedente'];
    const tokenCedente = req.headers['x-api-token-cedente'];

    if (!cnpjSh || !tokenSh || !cnpjCedente || !tokenCedente) {
      return res.status(401).json(unauthorizedError);
    }

    const softwareHouse = await SoftwareHouse.findOne({
      where: { cnpj: cnpjSh, token: tokenSh }
    });

    console.log('authMiddleware -> softwareHouse DB:', softwareHouse ? {
      id: softwareHouse.id, cnpj: softwareHouse.cnpj, token: softwareHouse.token, status: softwareHouse.status
    } : null);

    if (!softwareHouse || softwareHouse.status !== 'ativo') {
      return res.status(401).json(unauthorizedError);
    }

    const cedente = await Cedente.findOne({
      where: { cnpj: cnpjCedente, token: tokenCedente }
    });

    console.log('authMiddleware -> cedente DB:', cedente ? {
      id: cedente.id, cnpj: cedente.cnpj, token: cedente.token, status: cedente.status, softwarehouse_id: cedente.softwarehouse_id
    } : null);

    if (!cedente || cedente.status !== 'ativo') {
      return res.status(401).json(unauthorizedError);
    }

    if (cedente.softwarehouse_id !== softwareHouse.id) {
      return res.status(401).json(unauthorizedError);
    }

    req.softwareHouse = softwareHouse;
    req.cedente = cedente;

    next();
  } catch (error) {
    console.error('Erro no middleware de autenticação:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
}

module.exports = authMiddleware;
