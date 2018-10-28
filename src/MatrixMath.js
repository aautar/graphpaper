const MatrixMath = {

    mat4Multiply: function(_a, _b) {
        const identityMatrix = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
        const result = identityMatrix.splice(0);
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

    }
};

export { MatrixMath };
