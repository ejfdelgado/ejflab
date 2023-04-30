
class MyColor {
    static valueToHex(c) {
        let hex = c.toString(16);
        return ('0' + hex).slice(-2);
    }

    static int2colorhex(num) {
        const val = MyColor.int2color(num);
        return `#${MyColor.valueToHex(val.r)}${MyColor.valueToHex(val.g)}${MyColor.valueToHex(val.b)}`;
    }

    static getStepColors(max) {
        const mapa = {};
        for (let i = 0; i < max; i++) {
            mapa[i] = MyColor.int2colorhex(i);
        }
        return mapa;
    }

    static int2color(num) {
        //1
        //0.5, *
        //0.25, *, 0.75
        //0.125, *, 0.375, *, 0.625, *, 0.875
        //0.0625, *, 0.1875, *, 0.3125, *, 0.4375, *, 0.5625, *, 0.6875, *, 0.8125, *, 0.9375
        //0.03125, 0.09375, 0.15625, 0.21875, 0.28125, 0.34375, 0.40625, 0.46875, 0.53125, 0.59375, 0.65625, 0.71875, 0.78125, 0.84375, 0.90625, 0.96875
        const map = [1, 0.5, 0.25, 0.75, 0.125, 0.375, 0.625, 0.875, 0.0625, 0.1875, 0.3125, 0.4375, 0.5625, 0.6875, 0.8125, 0.9375, 0.03125, 0.09375, 0.15625, 0.21875, 0.28125, 0.34375, 0.40625, 0.46875, 0.53125, 0.59375, 0.65625, 0.71875, 0.78125, 0.84375, 0.90625, 0.96875];
        if (num == 0) {
            return { r: 255, g: 255, b: 255 };
        } else {
            const magico = map[(num - 1) % map.length];
            return MyColor.hsv2rgb(magico, 1, 1);
        }
    }
    // 0 <= h, s, v <= 1
    // 0 <= r, g, b <= 255
    static hsv2rgb(h, s, v) {
        var r, g, b, i, f, p, q, t;
        if (arguments.length === 1) {
            s = h.s, v = h.v, h = h.h;
        }
        i = Math.floor(h * 6);
        f = h * 6 - i;
        p = v * (1 - s);
        q = v * (1 - f * s);
        t = v * (1 - (1 - f) * s);
        switch (i % 6) {
            case 0: r = v, g = t, b = p; break;
            case 1: r = q, g = v, b = p; break;
            case 2: r = p, g = v, b = t; break;
            case 3: r = p, g = q, b = v; break;
            case 4: r = t, g = p, b = v; break;
            case 5: r = v, g = p, b = q; break;
        }
        return {
            r: Math.round(r * 255),
            g: Math.round(g * 255),
            b: Math.round(b * 255)
        };
    }
}

module.exports = {
    MyColor
};