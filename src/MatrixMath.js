const MatrixMath = {

    mat4Multiply: function(_a, _b) {

        const result = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
        for(let i=0; i<4; i++) {
            for(let j=0; j<4; j++) {

                var sum = 0;
                for(let k=0; k<4; k++) {
                    sum += _a[k + 4*i] * _b[j + 4*k];
                }

                result[j + 4*i] = sum;
            }
        }

        return result;
    },

    vecMat4Multiply: function(_v, _m) {
        const result = [0, 0, 0, 0];
        for(let vi=0; vi<4; vi++) {
            result[vi] = 
                (_v[0] * _m[(vi*4) + 0]) + 
                (_v[1] * _m[(vi*4) + 1]) + 
                (_v[2] * _m[(vi*4) + 2]) + 
                (_v[3] * _m[(vi*4) + 3]);
        }

        return result;
    }
};

export { MatrixMath };
