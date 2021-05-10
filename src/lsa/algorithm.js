"use strict";
var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spread = (this && this.__spread) || function () {
    for (var ar = [], i = 0; i < arguments.length; i++) ar = ar.concat(__read(arguments[i]));
    return ar;
};
exports.__esModule = true;
// @ts-ignore
var svd_js_1 = require("svd-js");
var fs = require("fs");
var path = require("path");
var getAllFiles = function (dirPath, arrayOfFiles) {
    var files = fs.readdirSync(dirPath);
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
var Lsa = /** @class */ (function () {
    function Lsa() {
        this.documents = [];
        this.stopwords = [];
        this.documents_name = [];
        this.dictionary = new Map();
    }
    Lsa.prototype.readRepository = function (dir) {
        var _this = this;
        var all_files = getAllFiles(dir, []);
        // console.log("all_files :" + all_files)
        all_files = all_files.filter(function (s) { return !s.includes("stopwords.json"); });
        all_files = all_files.filter(function (obj) { return (obj.includes("/src")); });
        all_files.forEach(function (s) { return _this.readDocument(s); });
    };
    Lsa.prototype.readDocument = function (fileName) {
        var document = fs.readFileSync(fileName, 'utf8');
        this.documents.push(document);
        this.documents_name.push(fileName);
    };
    Lsa.prototype.concatLisStrings = function (listStrings) {
        var e_1, _a;
        var finalString = "";
        try {
            for (var listStrings_1 = __values(listStrings), listStrings_1_1 = listStrings_1.next(); !listStrings_1_1.done; listStrings_1_1 = listStrings_1.next()) {
                var s = listStrings_1_1.value;
                finalString = finalString.concat(s.toString());
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (listStrings_1_1 && !listStrings_1_1.done && (_a = listStrings_1["return"])) _a.call(listStrings_1);
            }
            finally { if (e_1) throw e_1.error; }
        }
        return finalString;
    };
    Lsa.prototype.removeSpecialChars = function (documents) {
        for (var i = 0; i < documents.length; i++) {
            documents[i] = documents[i].replace('\n', '');
            documents[i] = documents[i].replace(/[`~!@#$%^&*()_|+\-=?;:'",.<>\{\}\[\]\\\/]/gi, '');
        }
        return documents;
    };
    Lsa.prototype.removeStopWords = function (documents, stopwords) {
        var tmp;
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
    };
    Lsa.prototype.listStringsupperCase = function (listStrings) {
        for (var i = 0; i < listStrings.length; i++) {
            listStrings[i] = listStrings[i].toUpperCase();
        }
        return listStrings;
    };
    Lsa.prototype.tokensGenerator = function (documents) {
        var documentsTokens = [];
        for (var i = 0; i < documents.length; i++) {
            documentsTokens.push(documents[i].split(" "));
        }
        return documentsTokens;
    };
    Lsa.prototype.removeWordsExpectIndexs = function (dictionary) {
        var e_2, _a;
        try {
            for (var _b = __values(dictionary.keys()), _c = _b.next(); !_c.done; _c = _b.next()) {
                var key = _c.value;
                if ((dictionary.get(key)).length < 2) {
                    dictionary["delete"](key);
                }
            }
        }
        catch (e_2_1) { e_2 = { error: e_2_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b["return"])) _a.call(_b);
            }
            finally { if (e_2) throw e_2.error; }
        }
        return dictionary;
    };
    Lsa.prototype.dictionarygenerator = function (documents, stopwords) {
        var dictionary = new Map();
        documents = this.removeSpecialChars(documents);
        documents = this.listStringsupperCase(documents);
        stopwords = this.listStringsupperCase(stopwords);
        var documentsTokens;
        documentsTokens = this.tokensGenerator(documents);
        documentsTokens = this.removeStopWords(documentsTokens, stopwords);
        for (var i = 0; i < documentsTokens.length; i++) {
            for (var j = 0; j < documentsTokens[i].length; j++) {
                if (dictionary.has(documentsTokens[i][j])) {
                    var list = [];
                    list = dictionary.get(documentsTokens[i][j]);
                    list.push(i + 1);
                    dictionary.set(documentsTokens[i][j], list);
                }
                else {
                    dictionary.set(documentsTokens[i][j], [i + 1]);
                }
            }
        }
        return new Map(__spread(dictionary).sort());
    };
    Lsa.prototype.matrix = function (dictionary, document) {
        var e_3, _a, e_4, _b;
        var matrix = [];
        try {
            // init matrix
            for (var _c = __values(dictionary.keys()), _d = _c.next(); !_d.done; _d = _c.next()) {
                var key = _d.value;
                var ligne = [];
                for (var i = 0; i < document.length; i++) {
                    ligne.push(0);
                }
                matrix.push(ligne);
            }
        }
        catch (e_3_1) { e_3 = { error: e_3_1 }; }
        finally {
            try {
                if (_d && !_d.done && (_a = _c["return"])) _a.call(_c);
            }
            finally { if (e_3) throw e_3.error; }
        }
        // editing cpts
        var j = 0;
        try {
            for (var _e = __values(dictionary.keys()), _f = _e.next(); !_f.done; _f = _e.next()) {
                var key = _f.value;
                var list = [];
                list = dictionary.get(key);
                for (var i = 0; i < list.length; i++) {
                    matrix[j][list[i] - 1]++;
                }
                j++;
            }
        }
        catch (e_4_1) { e_4 = { error: e_4_1 }; }
        finally {
            try {
                if (_f && !_f.done && (_b = _e["return"])) _b.call(_e);
            }
            finally { if (e_4) throw e_4.error; }
        }
        return matrix;
    };
    Lsa.prototype.matrixGenerator = function (dictionary, document) {
        var e_5, _a;
        var matrix = new Map();
        try {
            for (var _b = __values(dictionary.keys()), _c = _b.next(); !_c.done; _c = _b.next()) {
                var key = _c.value;
                var list = [];
                list = dictionary.get(key);
                for (var i = 0; i < list.length; i++) {
                    var indexDocument = list[i] - 1;
                    if (matrix.has(key)) {
                        var l = void 0;
                        l = (matrix.get(key));
                        var find = false;
                        for (var j = 0; j < l.length; j++) {
                            var doc = l[j][0];
                            var cpt = l[j][1];
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
        }
        catch (e_5_1) { e_5 = { error: e_5_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b["return"])) _a.call(_b);
            }
            finally { if (e_5) throw e_5.error; }
        }
        return matrix;
    };
    Lsa.prototype.numberWordsInDocument = function (matrix, index) {
        var e_6, _a;
        var cpt = 0;
        try {
            for (var _b = __values(this.dictionary.keys()), _c = _b.next(); !_c.done; _c = _b.next()) {
                var key = _c.value;
                var list = void 0;
                list = (matrix.get(key));
                for (var i = 0; i < list.length; i++) {
                    if (list[i][0] == index)
                        cpt++;
                }
            }
        }
        catch (e_6_1) { e_6 = { error: e_6_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b["return"])) _a.call(_b);
            }
            finally { if (e_6) throw e_6.error; }
        }
        return cpt;
    };
    Lsa.prototype.TFIDF = function (matrix) {
        var e_7, _a;
        try {
            for (var _b = __values(this.dictionary.keys()), _c = _b.next(); !_c.done; _c = _b.next()) {
                var key = _c.value;
                var list = void 0;
                list = (matrix.get(key));
                for (var i = 0; i < list.length; i++) {
                    var Nij = list[i][1];
                    var Nj = this.numberWordsInDocument(matrix, list[i][0]);
                    var D = this.documents.length;
                    var Di = (matrix.get(key)).length;
                    var calclog = (Math.log(D / Di));
                    var calcN = Nij / Nj;
                    list[i][1] = parseFloat((calcN * calclog).toPrecision(2));
                    matrix.set(key, list);
                }
            }
        }
        catch (e_7_1) { e_7 = { error: e_7_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b["return"])) _a.call(_b);
            }
            finally { if (e_7) throw e_7.error; }
        }
        return matrix;
    };
    Lsa.prototype.printMatrix = function (matrix) {
        var ligne = "";
        for (var i = 0; i < matrix.length; i++) {
            for (var j = 0; j < matrix[i].length; j++) {
                ligne = ligne.concat(matrix[i][j].toString());
            }
            console.log(ligne);
            ligne = "";
        }
    };
    Lsa.prototype.sliceMatrixCarree = function (matrix, from, end) {
        matrix = matrix.slice(from, end);
        for (var i = 0; i < end; i++) {
            matrix[i] = matrix[i].slice(from, end);
        }
        return matrix;
    };
    Lsa.prototype.sliceMatrixRect = function (matrix, numberLines) {
        return matrix.slice(0, numberLines);
    };
    Lsa.prototype.vectorToOrthMatrix = function (vector) {
        var matrix = [];
        for (var i = 0; i < vector.length; i++) {
            var ligne = [];
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
    };
    Lsa.prototype.transposeMatrix = function (matrix) {
        return matrix[0].map(function (_, colIndex) { return matrix.map(function (row) { return row[colIndex]; }); });
    };
    Lsa.prototype.multiplyMatrixs = function (matrix1, matrix2) {
        var numberRows1 = matrix1.length, numberCols1 = matrix1[0].length, numberRows2 = matrix2.length, numberCols2 = matrix2[0].length, matrix = new Array(numberRows1);
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
    };
    Lsa.prototype.index_of_key_in_map = function (mot_cle) {
        var e_8, _a;
        var indice = 0;
        try {
            for (var _b = __values(this.dictionary.keys()), _c = _b.next(); !_c.done; _c = _b.next()) {
                var key = _c.value;
                if (mot_cle.toLocaleUpperCase() == key) {
                    return indice;
                }
                indice++;
            }
        }
        catch (e_8_1) { e_8 = { error: e_8_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b["return"])) _a.call(_b);
            }
            finally { if (e_8) throw e_8.error; }
        }
        return -1;
    };
    Lsa.prototype.contient = function (list, chaine) {
        var e_9, _a;
        try {
            for (var list_1 = __values(list), list_1_1 = list_1.next(); !list_1_1.done; list_1_1 = list_1.next()) {
                var element = list_1_1.value;
                if (element.toLocaleUpperCase() == chaine)
                    return true;
            }
        }
        catch (e_9_1) { e_9 = { error: e_9_1 }; }
        finally {
            try {
                if (list_1_1 && !list_1_1.done && (_a = list_1["return"])) _a.call(list_1);
            }
            finally { if (e_9) throw e_9.error; }
        }
        return false;
    };
    Lsa.prototype.generator_query_vector = function (mot_cles) {
        var e_10, _a;
        var tokens_mots_cle;
        tokens_mots_cle = mot_cles.split(" ");
        var query = [];
        try {
            for (var _b = __values(this.dictionary.keys()), _c = _b.next(); !_c.done; _c = _b.next()) {
                var key = _c.value;
                if (this.contient(tokens_mots_cle, key)) {
                    query.push(1);
                }
                else {
                    query.push(0);
                }
            }
        }
        catch (e_10_1) { e_10 = { error: e_10_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b["return"])) _a.call(_b);
            }
            finally { if (e_10) throw e_10.error; }
        }
        return query;
    };
    Lsa.prototype.invers_matrix = function (M) {
        if (M.length !== M[0].length) {
            return [];
        }
        var i = 0, ii = 0, j = 0, dim = M.length, e = 0, t = 0;
        var I = [], C = [];
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
    };
    Lsa.prototype.slice_matrix_verticaly = function (matrix) {
        var tmp = [];
        for (var i = 0; i < matrix.length; i++) {
            tmp.push(matrix[i].slice(0, 2));
        }
        return tmp;
    };
    Lsa.prototype.transposeVector = function (query) {
        var tmp = [];
        for (var i = 0; i < query.length; i++) {
            tmp.push([query[i]]);
        }
        return tmp;
    };
    Lsa.prototype.multiply_vector_matrix = function (vector, matrix) {
        var tmp = [];
        console.log(vector);
        for (var i = 0; i < matrix.length; i++) {
            var res = 0;
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
    };
    Lsa.prototype.calcul_query_coords = function (q, u, s) {
        var res = [];
        var u_inv = this.invers_matrix(u);
        res = this.multiplyMatrixs(s, u_inv);
        return this.multiply_vector_matrix(q, res);
    };
    Lsa.prototype.cosinus_similarity = function (q, d) {
        var dot_product = ((q[0] * d[0]) + (q[1] * d[1]));
        var product_modulus = (Math.sqrt((q[0] * q[0]) + (q[1] * q[1])) * Math.sqrt((d[0] * d[0]) + (d[1] * d[1])));
        return dot_product / product_modulus;
    };
    Lsa.prototype.score_documents_generator = function (q, matrixV) {
        var tmp = [];
        for (var i = 0; i < matrixV.length; i++) {
            tmp.push(this.cosinus_similarity(q, matrixV[i]));
        }
        return tmp;
    };
    Lsa.prototype.lsa = function () {
        var matrixFinal = [];
        this.dictionary = this.dictionarygenerator(this.documents, this.stopwords);
        this.dictionary = this.removeWordsExpectIndexs(this.dictionary);
        console.log(this.dictionary);
        var matrix = [];
        matrix = this.matrix(this.dictionary, this.documents);
        var _a = svd_js_1.SVD(matrix), u = _a.u, v = _a.v, q = _a.q;
        var matrixQ = this.vectorToOrthMatrix(q);
        matrixQ = this.sliceMatrixCarree(matrixQ, 0, 2);
        var matrixV = v;
        var matrixU = u;
        matrixV = this.slice_matrix_verticaly(matrixV);
        console.log(matrixV);
        var mot_cles = readline.question("Veuillez saisir votre recherche : ");
        var query = this.generator_query_vector(mot_cles.toUpperCase());
        var querry_coor = this.calcul_query_coords(query, matrixQ, this.slice_matrix_verticaly(matrixU));
        console.log(querry_coor);
        var scores = this.score_documents_generator(querry_coor, matrixV);
        console.log("scores : " + scores);
        var name_docs = this.documents_name;
        console.log("names : " + name_docs);
        console.log(this.display_most_pertinent_documents(scores, name_docs, 0, scores.length - 1));
        matrixFinal = this.multiplyMatrixs(matrixQ, matrixV);
        return matrixFinal[0];
    };
    Lsa.prototype.readJson = function (fileName) {
        this.stopwords = JSON.parse(fs.readFileSync(fileName, 'utf8'));
    };
    Lsa.prototype.partate = function (scores, name_docs, low, high) {
        var pivot = scores[high];
        var i = (low - 1);
        for (var j = low; j <= high - 1; j++) {
            if (scores[j] > pivot) {
                i++;
                var temp = scores[i];
                scores[i] = scores[j];
                scores[j] = temp;
                var temp2 = name_docs[i];
                name_docs[i] = name_docs[j];
                name_docs[j] = temp2;
            }
        }
        var tempN = scores[high];
        scores[high] = scores[i + 1];
        scores[i + 1] = tempN;
        var tempN2 = name_docs[high];
        name_docs[high] = name_docs[i + 1];
        name_docs[i + 1] = tempN2;
        return (i + 1);
    };
    Lsa.prototype.display_most_pertinent_documents = function (scores, name_docs, low, high) {
        var tmp = [];
        if (low < high) {
            var p = void 0;
            p = this.partate(scores, name_docs, low, high);
            this.display_most_pertinent_documents(scores, name_docs, low, p - 1);
            this.display_most_pertinent_documents(scores, name_docs, p + 1, high);
        }
        tmp.push(scores);
        tmp.push(name_docs);
        return tmp;
    };
    return Lsa;
}());
var readline = require('readline-sync');
var docs = new Lsa();
docs.readJson('./Samples/stopwords.json');
var dir = "/home/edwin/Desktop/Cours/S2/PSTL/BankWebWithVariability";
docs.readRepository(dir);
var matrixResult = docs.lsa();
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
