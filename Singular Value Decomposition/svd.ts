let svd = require('svd-js');

let M = [
    [1, 1, 1, 0, 0],
    [3, 3, 3, 0, 0],
    [4, 4, 4, 0, 0],
    [5, 5, 5, 0, 0],
    [0, 2, 0, 4, 4],
    [0, 0, 0, 5, 5],
    [0, 1, 0, 2, 2]
  ]

let { U, V, S } = svd.SVD(M)
console.log(U)
console.log(V)
console.log(S)