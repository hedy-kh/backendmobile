const router = require('express').Router();
const { createProduct, getProduct, updateProduct, deleteProduct, activateProduct } = require('../controller/posts');
const { validateProduct } = require('../middlewares/validator');

router.post('/createProduct', validateProduct, createProduct);

// ta3tik produit bel id mte3ou 
router.get('/getProduct/:id', getProduct);

// ta3tik les produits lkol 
router.get('/getProduct', getProduct);

router.put('/updateProduct/:id', validateProduct, updateProduct);

router.delete('/deleteProduct/:id', deleteProduct);

router.post('/activateProduct/:id', activateProduct);

module.exports = router;
