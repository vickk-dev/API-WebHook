const { SoftwareHouse, Cedente } = require('../../../models'); 

async function authMiddleware(req, res, next) {
    try {
       
        const unauthorizedError = { message: "Não autorizado" };

       
        const cnpjSh = req.headers['x-api-cnpj-sh'];
        const tokenSh = req.headers['x-api-token-sh'];
        const cnpjCedente = req.headers['x-api-cnpj-cedente']; 
        const tokenCedente = req.headers['x-api-token-cedente']; 

        if (!cnpjSh || !tokenSh || !cnpjCedente || !tokenCedente ) {

            return res.status(401).json(unauthorizedError);
        }

        
      
        const softwareHouse = await SoftwareHouse.findOne({
            where:{
                cnpj: cnpjSh,
                token: tokenSh,
            },
        });

        if (!softwareHouse || softwareHouse.status !== 'ativo'){
          
            return res.status(401).json(unauthorizedError);  
        }

         const cedente = await Cedente.findOne({
            where:{
                cnpj: cnpjCedente,
                token: tokenCedente,
            },
        });

        if (!cedente || cedente.status !== 'ativo'){
    
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