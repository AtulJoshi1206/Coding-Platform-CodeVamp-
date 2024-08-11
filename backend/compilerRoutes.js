const express = require('express');
const router = express.Router();
const compileCpp = require('../compiler/cppCompiler');
const compileJava = require('../compiler/javaCompiler');
const compilePython = require('../compiler/pythonCompiler');

router.post('/', (req, res) => {
    const { code, language } = req.body;

    const compileFunctions = {
        cpp: compileCpp,
        java: compileJava,
        python: compilePython
    };

    const compile = compileFunctions[language];

    compile(code, (output) => {
        res.json({ output });
    });
});

module.exports = router;
