const {SoftwareHouse, Cendente} = require('../../../models');
async function authMiddleware(req, res, next) {
    try {
        const cnpjSh = req.headers['cnpj-sh'];
        const tokenSh = req.headers['token-sh'];
        const cnpjCendente = req.headers['cnpj-cendente'];
        const tokenCendente = req.headers['token-cendente'];
        if (!cnpjSh || !tokenSh || !cnpjCendente || !tokenCendente ) {
            return res.status(401).json({ message: 'Headers incompletos' });
        }

        const softwareHouse = await SoftwareHouse.findOne({
            where:{
                cnpj: cnpjSh,
                token: tokenSh,
                
            },
    });
        if (!softwareHouse || softwareHouse.status !== 'ativo'){
            return res.status(401).json({ message: 'Credenciais da Software House inválidas ou inativas' });  

        } 
         const cendente =await Cendente.findOne({
            where:{
                cnpj: cnpjCendente,
                token: tokenCendente,
                
            },
        });
        if (!cendente || cendente.status !== 'ativo'){
            return res.status(401).json({ message: 'Credenciais do Cedente inválidas ou inativas.' });
        }

        if (cendente.softwarehouse_id !== softwareHouse.id) {
            return res.status(401).json({ message: 'Cendente não associado à Software House.' });
        }
        
        req.softwareHouse = softwareHouse;
        req.cendente = cendente;
       
        next();
    }catch (error) {
        console.error('Erro no middleware de autenticação:', error);
        res.status(500).json({ message: 'Erro interno do servidor' });
    }
}
module.exports = authMiddleware;