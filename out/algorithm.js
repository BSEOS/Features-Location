"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LSA = exports.f = void 0;
// @ts-ignore
const svd_js_1 = require("svd-js");
// import getStdin from 'get-stdin';
const vscode_1 = require("vscode");
const f = function () {
    let p = new vscode_1.Position(2, 3);
    let q = new vscode_1.Position(4, 5);
    let r = new vscode_1.Range(p, q);
    console.log(r);
};
exports.f = f;
const fs = require("fs");
const path = require("path");
const readline = require('readline-sync');
const getAllFiles = function (dirPath, arrayOfFiles) {
    let files = fs.readdirSync(dirPath);
    arrayOfFiles = arrayOfFiles || [];
    files.forEach(function (file) {
        if (fs.statSync(dirPath + "/" + file).isDirectory()) {
            arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles);
        }
        else {
            arrayOfFiles.push(path.join(dirPath, "/", file));
        }
    });
    return arrayOfFiles;
};
class LSA {
    constructor() {
        this.documents = [];
        this.stopwords = [];
        this.documents_name = [];
        this.dictionary = new Map();
    }
    readRepository(dir) {
        let all_files = getAllFiles(dir, []);
        // console.log("all_files :" + all_files)
        all_files = all_files.filter(s => !s.includes("stopwords.json"));
        all_files = all_files.filter(obj => (obj.includes("/src")));
        all_files.forEach(s => this.readDocument(s));
    }
    readDocument(fileName) {
        let document = fs.readFileSync(fileName, 'utf8');
        this.documents.push(document);
        this.documents_name.push(fileName);
    }
    concatLisStrings(listStrings) {
        let finalString = "";
        for (let s of listStrings) {
            finalString = finalString.concat(s.toString());
        }
        return finalString;
    }
    removeSpecialChars(documents) {
        for (var i = 0; i < documents.length; i++) {
            documents[i] = documents[i].replace('\n', '');
            documents[i] = documents[i].replace(/[`~!@#$%^&*()_|+\-=?;:'",.<>\{\}\[\]\\\/]/gi, '');
        }
        return documents;
    }
    removeStopWords(documents, stopwords) {
        let tmp;
        for (var i = 0; i < documents.length; i++) {
            for (var j = 0; j < stopwords.length; j++) {
                for (var k = 0; k < documents[i].length; k++) {
                    if (documents[i][k] == stopwords[j]) {
                        tmp = documents[i][documents[i].length - 1];
                        documents[i][k] = tmp;
                        documents[i].pop();
                    }
                }
            }
        }
        return documents;
    }
    listStringsupperCase(listStrings) {
        for (var i = 0; i < listStrings.length; i++) {
            listStrings[i] = listStrings[i].toUpperCase();
        }
        return listStrings;
    }
    tokensGenerator(documents) {
        let documentsTokens = [];
        for (var i = 0; i < documents.length; i++) {
            documentsTokens.push(documents[i].split(" "));
        }
        return documentsTokens;
    }
    removeWordsExpectIndexs(dictionary) {
        for (let key of dictionary.keys()) {
            if ((dictionary.get(key)).length < 2) {
                dictionary.delete(key);
            }
        }
        return dictionary;
    }
    dictionarygenerator(documents, stopwords) {
        let dictionary = new Map();
        documents = this.removeSpecialChars(documents);
        documents = this.listStringsupperCase(documents);
        stopwords = this.listStringsupperCase(stopwords);
        let documentsTokens;
        documentsTokens = this.tokensGenerator(documents);
        documentsTokens = this.removeStopWords(documentsTokens, stopwords);
        for (var i = 0; i < documentsTokens.length; i++) {
            for (var j = 0; j < documentsTokens[i].length; j++) {
                if (dictionary.has(documentsTokens[i][j])) {
                    let list = [];
                    list = dictionary.get(documentsTokens[i][j]);
                    list.push(i + 1);
                    dictionary.set(documentsTokens[i][j], list);
                }
                else {
                    dictionary.set(documentsTokens[i][j], [i + 1]);
                }
            }
        }
        return new Map([...dictionary].sort());
    }
    matrix(dictionary, document) {
        let matrix = [];
        // init matrix
        for (let key of dictionary.keys()) {
            let ligne = [];
            for (var i = 0; i < document.length; i++) {
                ligne.push(0);
            }
            matrix.push(ligne);
        }
        // editing cpts
        let j = 0;
        for (let key of dictionary.keys()) {
            let list = [];
            list = dictionary.get(key);
            for (var i = 0; i < list.length; i++) {
                matrix[j][list[i] - 1]++;
            }
            j++;
        }
        return matrix;
    }
    matrixGenerator(dictionary, document) {
        let matrix = new Map();
        for (let key of dictionary.keys()) {
            let list = [];
            list = dictionary.get(key);
            for (var i = 0; i < list.length; i++) {
                let indexDocument = list[i] - 1;
                if (matrix.has(key)) {
                    let l;
                    l = (matrix.get(key));
                    let find = false;
                    for (var j = 0; j < l.length; j++) {
                        let doc = l[j][0];
                        let cpt = l[j][1];
                        if (doc == indexDocument + 1) {
                            l[j] = [indexDocument + 1, 1 + cpt];
                            matrix.set(key, l);
                            find = true;
                        }
                        if (find == true)
                            break;
                    }
                    if (find == false) {
                        l.push([indexDocument + 1, 1]);
                        matrix.set(key, l);
                    }
                }
                else {
                    matrix.set(key, [[indexDocument + 1, 1]]);
                }
            }
        }
        return matrix;
    }
    numberWordsInDocument(matrix, index) {
        let cpt = 0;
        for (let key of this.dictionary.keys()) {
            let list;
            list = (matrix.get(key));
            for (var i = 0; i < list.length; i++) {
                if (list[i][0] == index)
                    cpt++;
            }
        }
        return cpt;
    }
    TFIDF(matrix) {
        for (let key of this.dictionary.keys()) {
            let list;
            list = (matrix.get(key));
            for (var i = 0; i < list.length; i++) {
                let Nij = list[i][1];
                let Nj = this.numberWordsInDocument(matrix, list[i][0]);
                let D = this.documents.length;
                let Di = (matrix.get(key)).length;
                let calclog = (Math.log(D / Di));
                let calcN = Nij / Nj;
                list[i][1] = parseFloat((calcN * calclog).toPrecision(2));
                matrix.set(key, list);
            }
        }
        return matrix;
    }
    printMatrix(matrix) {
        let ligne = "";
        for (var i = 0; i < matrix.length; i++) {
            for (var j = 0; j < matrix[i].length; j++) {
                ligne = ligne.concat(matrix[i][j].toString());
            }
            console.log(ligne);
            ligne = "";
        }
    }
    sliceMatrixCarree(matrix, from, end) {
        matrix = matrix.slice(from, end);
        for (var i = 0; i < end; i++) {
            matrix[i] = matrix[i].slice(from, end);
        }
        return matrix;
    }
    sliceMatrixRect(matrix, numberLines) {
        return matrix.slice(0, numberLines);
    }
    vectorToOrthMatrix(vector) {
        let matrix = [];
        for (var i = 0; i < vector.length; i++) {
            let ligne = [];
            for (var j = 0; j < vector.length; j++) {
                if (i == j) {
                    ligne.push(parseFloat(vector[i].toPrecision(2)));
                }
                else {
                    ligne.push(0);
                }
                ;
            }
            matrix.push(ligne);
        }
        return matrix;
    }
    transposeMatrix(matrix) {
        return matrix[0].map((_, colIndex) => matrix.map(row => row[colIndex]));
    }
    multiplyMatrixs(matrix1, matrix2) {
        let numberRows1 = matrix1.length, numberCols1 = matrix1[0].length, numberRows2 = matrix2.length, numberCols2 = matrix2[0].length, matrix = new Array(numberRows1);
        for (var r = 0; r < numberRows1; ++r) {
            matrix[r] = new Array(numberCols2); // initialize the current row
            for (var c = 0; c < numberCols2; ++c) {
                matrix[r][c] = 0; // initialize the current cell
                for (var i = 0; i < numberCols1; ++i) {
                    matrix[r][c] += matrix1[r][i] * matrix2[i][c];
                }
            }
        }
        return matrix;
    }
    index_of_key_in_map(mot_cle) {
        let indice = 0;
        for (let key of this.dictionary.keys()) {
            if (mot_cle.toLocaleUpperCase() == key) {
                return indice;
            }
            indice++;
        }
        return -1;
    }
    contient(list, chaine) {
        for (let element of list) {
            if (element.toLocaleUpperCase() == chaine)
                return true;
        }
        return false;
    }
    generator_query_vector(mot_cles) {
        let tokens_mots_cle;
        tokens_mots_cle = mot_cles.split(" ");
        let query = [];
        for (let key of this.dictionary.keys()) {
            if (this.contient(tokens_mots_cle, key)) {
                query.push(1);
            }
            else {
                query.push(0);
            }
        }
        return query;
    }
    invers_matrix(M) {
        if (M.length !== M[0].length) {
            return [];
        }
        var i = 0, ii = 0, j = 0, dim = M.length, e = 0, t = 0;
        let I = [], C = [];
        for (i = 0; i < dim; i += 1) {
            // Create the row
            I[I.length] = [];
            C[C.length] = [];
            for (j = 0; j < dim; j += 1) {
                if (i == j) {
                    I[i][j] = 1;
                }
                else {
                    I[i][j] = 0;
                }
                C[i][j] = M[i][j];
            }
        }
        for (i = 0; i < dim; i += 1) {
            e = C[i][i];
            if (e == 0) {
                for (ii = i + 1; ii < dim; ii += 1) {
                    if (C[ii][i] != 0) {
                        for (j = 0; j < dim; j++) {
                            e = C[i][j];
                            C[i][j] = C[ii][j];
                            C[ii][j] = e;
                            e = I[i][j];
                            I[i][j] = I[ii][j];
                            I[ii][j] = e;
                        }
                        break;
                    }
                }
                e = C[i][i];
                if (e == 0) {
                    return [];
                }
            }
            for (j = 0; j < dim; j++) {
                C[i][j] = C[i][j] / e;
                I[i][j] = I[i][j] / e;
            }
            for (ii = 0; ii < dim; ii++) {
                if (ii == i) {
                    continue;
                }
                e = C[ii][i];
                for (j = 0; j < dim; j++) {
                    C[ii][j] -= e * C[i][j];
                    I[ii][j] -= e * I[i][j];
                }
            }
        }
        return I;
    }
    slice_matrix_verticaly(matrix) {
        let tmp = [];
        for (var i = 0; i < matrix.length; i++) {
            tmp.push(matrix[i].slice(0, 2));
        }
        return tmp;
    }
    transposeVector(query) {
        let tmp = [];
        for (var i = 0; i < query.length; i++) {
            tmp.push([query[i]]);
        }
        return tmp;
    }
    multiply_vector_matrix(vector, matrix) {
        let tmp = [];
        console.log(vector);
        for (var i = 0; i < matrix.length; i++) {
            let res = 0;
            for (var j = 0; j < vector.length; j++) {
                if (vector[j] > 0) {
                    if (matrix[j][i] != null)
                        res = res + matrix[j][i];
                }
            }
            if (res != 0) {
                tmp.push(res);
            }
        }
        return tmp;
    }
    calcul_query_coords(q, u, s) {
        let res = [];
        let u_inv = this.invers_matrix(u);
        res = this.multiplyMatrixs(s, u_inv);
        return this.multiply_vector_matrix(q, res);
    }
    cosinus_similarity(q, d) {
        let dot_product = ((q[0] * d[0]) + (q[1] * d[1]));
        let product_modulus = (Math.sqrt((q[0] * q[0]) + (q[1] * q[1])) * Math.sqrt((d[0] * d[0]) + (d[1] * d[1])));
        return dot_product / product_modulus;
    }
    score_documents_generator(q, matrixV) {
        let tmp = [];
        for (var i = 0; i < matrixV.length; i++) {
            tmp.push(this.cosinus_similarity(q, matrixV[i]));
        }
        return tmp;
    }
    lsa(request, dir, stop_file) {
        this.readJson(stop_file);
        // let dir = "/home/edwin/Desktop/Cours/S2/PSTL/BankWebWithVariability"
        this.readRepository(dir);
        let matrixFinal = [];
        this.dictionary = this.dictionarygenerator(this.documents, this.stopwords);
        this.dictionary = this.removeWordsExpectIndexs(this.dictionary);
        console.log(this.dictionary);
        let matrix = [];
        matrix = this.matrix(this.dictionary, this.documents);
        const { u, v, q } = svd_js_1.SVD(matrix);
        let matrixQ = this.vectorToOrthMatrix(q);
        matrixQ = this.sliceMatrixCarree(matrixQ, 0, 2);
        let matrixV = v;
        let matrixU = u;
        matrixV = this.slice_matrix_verticaly(matrixV);
        console.log(matrixV);
        // var mot_cles: String = readline.question("Veuillez saisir votre recherche : ");
        var mot_cles = request;
        let query = this.generator_query_vector(mot_cles.toUpperCase());
        let querry_coor = this.calcul_query_coords(query, matrixQ, this.slice_matrix_verticaly(matrixU));
        console.log(querry_coor);
        let scores = this.score_documents_generator(querry_coor, matrixV);
        console.log("scores : " + scores);
        let name_docs = this.documents_name;
        console.log("names : " + name_docs);
        console.log(this.display_most_pertinent_documents(scores, name_docs, 0, scores.length - 1));
        matrixFinal = this.multiplyMatrixs(matrixQ, matrixV);
        return matrixFinal[0];
    }
    readJson(fileName) {
        this.stopwords = JSON.parse(fs.readFileSync(fileName, 'utf8'));
    }
    partate(scores, name_docs, low, high) {
        let pivot = scores[high];
        let i = (low - 1);
        for (let j = low; j <= high - 1; j++) {
            if (scores[j] > pivot) {
                i++;
                let temp = scores[i];
                scores[i] = scores[j];
                scores[j] = temp;
                let temp2 = name_docs[i];
                name_docs[i] = name_docs[j];
                name_docs[j] = temp2;
            }
        }
        let tempN = scores[high];
        scores[high] = scores[i + 1];
        scores[i + 1] = tempN;
        let tempN2 = name_docs[high];
        name_docs[high] = name_docs[i + 1];
        name_docs[i + 1] = tempN2;
        return (i + 1);
    }
    display_most_pertinent_documents(scores, name_docs, low, high) {
        let tmp = [];
        if (low < high) {
            let p;
            p = this.partate(scores, name_docs, low, high);
            this.display_most_pertinent_documents(scores, name_docs, low, p - 1);
            this.display_most_pertinent_documents(scores, name_docs, p + 1, high);
        }
        tmp.push(scores);
        tmp.push(name_docs);
        return tmp;
    }
}
exports.LSA = LSA;
// console.log(docs.documents_name)
//console.log(matrixResult);
/* comments in lsa
                console.log(this.index_of_key_in_map("RICH"));
        console.log(this.generator_query_vector("RICH ESTATE"));
        let matrix : number[][] = [
            [1,1,0,0,1,0,0,1], [1,0,0,0,1,1,0,1], [1,0,1,0,1,0,1,0], [0,1,0,0,0,1,0,0],
            [0,1,0,0,1,1,0,0], [0,1,1,0,1,1,0,0], [0,0,0,0,1,1,0,0], [0,0,0,0,1,0,1,0],
            [0,0,0,0,1,0,1,1]
        ];

        let matrix : number[][]= [
            [1,1,1], [0,1,1], [1,0,0], [0,1,0], [1,0,0], [1,0,1], [1,1,1], [1,1,1], [1,0,1], [0,2,0], [0,1,1]
        ];

        let query = [0,0,0,0,0,1,0,0,0,1,1];
*/ 
//# sourceMappingURL=algorithm.js.map