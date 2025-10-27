const express = require('express');
const router = express.Router();
const { 
  listarProtocolosController, 
  consultarProtocoloController 
} = require('../controller/ProtocoloController');
const { validateRequest } = require('../config/middlewares/validationMiddleware');
const { 
  listagemProtocolosSchema, 
  consultaIndividualSchema 
} = require('../config/validators/ProtocoloValidator');

/**
 * GET /api/protocolo
 * Lista protocolos com filtros
 * Query params:
 *  - start_date: Data inicial (obrigatório)
 *  - end_date: Data final (obrigatório)
 *  - product: Produto (opcional: boleto, pagamento, pix)
 *  - id: Array de IDs ou ID único (opcional)
 *  - kind: Tipo de notificação (opcional: webhook, evento, agendamento)
 *  - type: Situação (opcional: disponivel, cancelado, pago)
 */
router.get(
  '/protocolo', 
  validateRequest(listagemProtocolosSchema, 'query'),
  listarProtocolosController
);

/**
 * GET /api/protocolo/:uuid
 * Consulta individual de protocolo
 * Params:
 *  - uuid: UUID do protocolo (obrigatório)
 */
router.get(
  '/protocolo/:uuid',
  validateRequest(consultaIndividualSchema, 'params'),
  consultarProtocoloController
);

module.exports = router;
