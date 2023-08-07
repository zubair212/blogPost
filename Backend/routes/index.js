
const express = require('express');
const authcontroller = require('../controller/authcontroller');
const auth=require('../middlewere/auth');
const blogController=require('../controller/blogController');
const commentController = require('../controller/commentController');
const router = express.Router();



router.get('/test',  (req, res) => res.json({ msg: 'Working' }));




router.post('/register', authcontroller.register);


router.post('/login', authcontroller.login);


router.post('/logout',auth, authcontroller.logout);

router.get('/refresh', authcontroller.refresh);


//blogs
//create
router.post('/blog',auth, blogController.create);


//get all

router.get('/blog/all',auth, blogController.getAll);


//get blog by id

router.get('/blog/:id', auth, blogController.getById);

//update
router.put('/blog',auth, blogController.update);

//delete
router.delete('/blog/:id',auth, blogController.delete);

//Comments
//create
router.post('/comment',auth, commentController.create);


//get


router.get('/comment/:id',auth, commentController.getById);



module.exports =router;