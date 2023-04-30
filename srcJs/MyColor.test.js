const { MyColor } = require("./MyColor");

function test1() {
    const pruebas = [
        { h: 1, s: 1, v: 1 },
    ];

    for (let i = 0; i < pruebas.length; i++) {
        const prueba = pruebas[i];
        const response = MyColor.hsv2rgb(prueba.h, prueba.s, prueba.v);
        console.log(JSON.stringify(response));
    }

    for (let i = 0; i < 100; i++) {
        console.log(MyColor.int2colorhex(i));
    }
}

test1();