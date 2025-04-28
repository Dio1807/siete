const {Router} = require("express");
const { getPeriodos } = require("../controllers/periodos");
const router = Router();

router.get('', getPeriodos);

module.exports=router;