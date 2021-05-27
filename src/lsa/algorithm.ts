// @ts-ignore
import { SVD } from 'svd-js'
// import getStdin from 'get-stdin';
import { Uri, Range, Position } from 'vscode';


const fs = require("fs");
const path = require("path")
const readline = require('readline-sync');



const getAllFiles = function (dirPath: String, arrayOfFiles: String[]) {
    let files: String[] = fs.readdirSync(dirPath)

    arrayOfFiles = arrayOfFiles || []

    files.forEach(function (file) {
        if (fs.statSync(dirPath + "/" + file).isDirectory()) {
            arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles)
        } else {
            arrayOfFiles.push(path.join(dirPath, "/", file))
        }
    })

    return arrayOfFiles
}

class LSA {

    documents: String[] = [];
    stopwords: String[] = [];
    documents_name: String[] = [];
    documents_name_invar: String[] = [];
    dictionary = new Map<String, number[]>();
    documentLinesR = new Map<number, [String, Range][]>();
    documentLinesS = new Map<number, String[]>();
    tokenRequestScores = new Map<String, number[]>();

    request_file: String = ""

    //U, V, Q
    matrices: [number[][], number[][], number[][]] = [[], [], []];

    constructor() {
    }

    readRepository(dir: String) {
        let all_files = getAllFiles(dir, [])
        all_files = all_files.filter(s => !s.includes("stopwords.json") && !s.includes("/bin") && !s.includes("/obj") && !s.includes("/build") && !s.includes("/deploy")&& !s.includes("/img"))
        all_files.forEach(s => this.readDocument(s))
    }

    readDocument(fileName: String) {
        let document: String = fs.readFileSync(fileName, 'utf8');
        this.documents.push(document);
        this.documents_name.push(fileName);
        this.documents_name_invar.push(fileName);
    }


    concatLisStrings(listStrings: String[]): String {
        let finalString: String = "";
        for (let s of listStrings) {
            finalString = finalString.concat(s.toString());
        }
        return finalString;
    }

    removeSpecialChars(documents: String[], isRequests : boolean): String[] {
        if (isRequests){
            for (var i = 0; i < documents.length; i++) {
                let listLines : String[] = [];
                documents[i] = documents[i].replace('\n', ' ');
                documents[i] = documents[i].replace(/[`~!@#$%^&*()_|+\-=?;:'",.<>\{\}\[\]\\\/]/gi, ' ');
                for (var j = 0; j < this.documentLinesS.get(i)!.length; j++) {
                    listLines.push(this.documentLinesS.get(i)![j])
                    listLines[j] =  listLines[j].replace('\n', '');
                    listLines[j] = listLines[j].replace(/[`~!@#$%^&*()_|+\-=?;:'",.<>\{\}\[\]\\\/]/gi, ' ');
                }
            }
            return documents;
        } else {
            let tmpDocumentLinesS : Map<number, String[]> = new Map<number, String[]>();
            for (var i = 0; i < documents.length; i++) {
                let listLines : String[] = [];
                documents[i] = documents[i].replace('\n', ' ');
                documents[i] = documents[i].replace(/[`~!@#$%^&*()_|+\-=?;:'",.<>\{\}\[\]\\\/]/gi, ' ');
                for (var j = 0; j < this.documentLinesS.get(i)!.length; j++) {
                    listLines.push(this.documentLinesS.get(i)![j])
                    listLines[j] =  listLines[j].replace('\n', '');
                    listLines[j] = listLines[j].replace(/[`~!@#$%^&*()_|+\-=?;:'",.<>\{\}\[\]\\\/]/gi, ' ');
                }
                tmpDocumentLinesS.set(i, listLines);
            }
            this.documentLinesS = tmpDocumentLinesS;
            return documents;
        }
    }

    removeStopWords(documents: String[][], stopwords: String[]): String[][] {
        let tmp: String;
        let tmp2: [String, Range];
        let tmpDocumentLinesR: Map<number, [String, Range][]> = new Map<number, [String, Range][]>();
        for (var i = 0; i < documents.length; i++) {
            let listtokens: [String, Range][] = this.documentLinesR.get(i)!;
            for (var j = 0; j < stopwords.length; j++) {
                for (var k = 0; k < documents[i].length; k++) {
                    if (documents[i][k] == stopwords[j]) {
                        tmp = documents[i][documents[i].length - 1];
                        documents[i][k] = tmp;
                        documents[i].pop();
                    }
                }
                for (var x = 0; x < listtokens.length; x++) {
                    if (listtokens[x][0] == stopwords[j]) {
                        tmp2 = listtokens[listtokens.length - 1];
                        listtokens[x] = tmp2;
                        listtokens.pop();
                    }
                }
            }
            tmpDocumentLinesR.set(i, listtokens);
        }
        this.documentLinesR = tmpDocumentLinesR;
        return documents;
    }

    listStringsupperCase(listStrings: String[]): String[] {
        for (var i = 0; i < listStrings.length; i++) {
            listStrings[i] = listStrings[i].toUpperCase();
        }
        return listStrings;
    }


    upperCaselinesS() {
        let tmpDocumentLinesS: Map<number, String[]> = new Map<number, String[]>();
        for (var i = 0; i < this.documents.length; i++) {
            let listLines: String[] = [];
            for (var j = 0; j < this.documentLinesS.get(i)!.length; j++) {
                listLines.push(this.documentLinesS.get(i)![j])
                listLines[j] = listLines[j].toUpperCase();
            }
            tmpDocumentLinesS.set(i, listLines);
        }
        this.documentLinesS = tmpDocumentLinesS;
    }

    tokensGenerator(documents: String[]): String[][] {
        let documentsTokens: String[][] = [];
        for (var i = 0; i < documents.length; i++) {
            let dictionnaire: [String, Range][] = [];
            for (var j = 0; j < this.documentLinesS.get(i)!.length; j++) {
                let line: String = this.documentLinesS.get(i)![j];
                let tokensLine: String[] = line.split(" ")
                // let lastDepth = 0;
                for (var k = 0; k < tokensLine.length; k++) {
                    dictionnaire.push([tokensLine[k], new Range(new Position(j + 1, 0), new Position(j + 1, this.documentLinesS.get(i)!.length))]);
                    //  lastDepth = tokensLine[k].length
                }
            }
            this.documentLinesR.set(i, dictionnaire)
        }
        for (var i = 0; i < documents.length; i++) {
            documentsTokens.push(documents[i].split(" "));
        }
        return documentsTokens;
    }

    removeWordsExpectIndexs(dictionary: Map<String, number[]>): Map<String, number[]> {
        for (let key of dictionary.keys()) {
            if ((dictionary.get(key)!).length < 2) {
                dictionary.delete(key);
            }
        }
        return dictionary;
    }

    dictionarygenerator(documents: String[], stopwords: String[]): Map<String, number[]> {
        let dictionary = new Map<String, number[]>();
        documents = this.removeSpecialChars(documents);
        documents = this.listStringsupperCase(documents);
        this.upperCaselinesS();
        stopwords = this.listStringsupperCase(stopwords);
        let documentsTokens: String[][];
        documentsTokens = this.tokensGenerator(documents);
        documentsTokens = this.removeStopWords(documentsTokens, stopwords);
        for (var i = 0; i < documentsTokens.length; i++) {
            for (var j = 0; j < documentsTokens[i].length; j++) {
                if (dictionary.has(documentsTokens[i][j])) {
                    let list: number[] = [];
                    list = dictionary.get(documentsTokens[i][j])!;
                    list.push(i + 1);
                    dictionary.set(documentsTokens[i][j], list);
                } else {
                    dictionary.set(documentsTokens[i][j], [i + 1]);
                }
            }
        }
        return new Map([...dictionary].sort());
    }

    matrix(dictionary: Map<String, number[]>, document: String[]): number[][] {
        let matrix: number[][] = [];
        // init matrix
        for (let key of dictionary.keys()) {
            let ligne: number[] = [];
            for (var i = 0; i < document.length; i++) {
                ligne.push(0);
            }
            matrix.push(ligne);
        }
        // editing cpts
        let j = 0;
        for (let key of dictionary.keys()) {
            let list: number[] = [];
            list = dictionary.get(key)!;
            for (var i = 0; i < list.length; i++) {
                matrix[j][list[i] - 1]++;
            }
            j++;
        }
        return matrix;
    }

    matrixGenerator(dictionary: Map<String, number[]>, document: String[]): Map<String, [number, number][]> {
        let matrix = new Map<String, [number, number][]>();
        for (let key of dictionary.keys()) {
            let list: number[] = [];
            list = dictionary.get(key)!;
            for (var i = 0; i < list.length; i++) {
                let indexDocument = list[i] - 1;
                if (matrix.has(key)) {
                    let l: [number, number][];
                    l = (matrix.get(key)!);
                    let find: boolean = false;
                    for (var j = 0; j < l.length; j++) {
                        let doc = l[j][0];
                        let cpt = l[j][1];
                        if (doc == indexDocument + 1) {
                            l[j] = [indexDocument + 1, 1 + cpt];
                            matrix.set(key, l);
                            find = true;
                        }
                        if (find == true) break;
                    }
                    if (find == false) {
                        l.push([indexDocument + 1, 1]);
                        matrix.set(key, l);
                    }
                } else {
                    matrix.set(key, [[indexDocument + 1, 1]]);
                }
            }
        }
        return matrix;
    }

    numberWordsInDocument(matrix: Map<String, [number, number][]>, index: number): number {
        let cpt = 0;
        for (let key of this.dictionary.keys()) {
            let list: [number, number][];
            list = (matrix.get(key)!);
            for (var i = 0; i < list.length; i++) {
                if (list[i][0] == index) cpt++
            }
        }
        return cpt;
    }

    /* TFIDF(matrix: Map<String, [number, number][]>): Map<String, [number, number][]> {
         for (let key of this.dictionary.keys()) {
             let list: [number, number][];
             list = (matrix.get(key)!);
             for (var i = 0; i < list.length; i++) {
                 let Nij: number = list[i][1];
                 let Nj: number = this.numberWordsInDocument(matrix, list[i][0]);
                 let D: number = this.documents.length;
                 let Di: number = (matrix.get(key)!).length;
                 let calclog: number = (Math.log(D / Di));
                 let calcN: number = Nij / Nj;
                 list[i][1] = parseFloat((calcN * calclog).toPrecision(2));
                 matrix.set(key, list);
             }
         }
         return matrix;
     }*/

    countColomnes(matrix: number[][], index: number): number {
        let res: number = 0;
        for (var i = 0; i < matrix.length; i++) {
            res = res + matrix[i][index];
        }
        return res;
    }

    countNumberDocumentsAppearWord(matrix: number[][], index: number): number {
        let res: number = 0;
        for (var i = 0; i < this.documents.length; i++) {
            if (matrix[index][i] > 0) {
                res++;
            }
        }
        return res;
    }

    TFIDF(matrix: number[][]): number[][] {
        let keys = Array.from(this.dictionary.keys());
        let Nj: number[] = []
        for (var i = 0; i < matrix.length; i++) {
            let Di = this.dictionary.get(keys[i])!.filter(function (elem, index, self) {
                return index === self.indexOf(elem);
            }).length
            let D: number = this.documents.length;
            for (var j = 0; j < matrix[i].length; j++) {
                if (i == 0) {
                    Nj[j] = this.countColomnes(matrix, j);
                }
                let Nij: number = matrix[i][j];
                //  let Di: number = this.countNumberDocumentsAppearWord(matrix, i);
                let calclog: number = (Math.log(D / Di));
                let calcN: number = Nij / Nj[j];
                matrix[i][j] = (calcN * calclog);
            }
        }
        return matrix;
    }

    printMatrix(matrix: number[][]) {
        let ligne: String = "";
        for (var i = 0; i < matrix.length; i++) {
            for (var j = 0; j < matrix[i].length; j++) {
                ligne = ligne.concat(matrix[i][j].toString());
            }
            ligne = "";
        }
    }

    sliceMatrixCarree(matrix: number[][], from: number, end: number): number[][] {
        matrix = matrix.slice(from, end);
        for (var i = 0; i < end; i++) {
            matrix[i] = matrix[i].slice(from, end);
        }
        return matrix;
    }

    sliceMatrixRect(matrix: number[][], numberLines: number): number[][] {
        return matrix.slice(0, numberLines);
    }

    vectorToOrthMatrix(vector: number[]): number[][] {
        let matrix: number[][] = [];
        for (var i = 0; i < vector.length; i++) {
            let ligne: number[] = [];
            for (var j = 0; j < vector.length; j++) {
                if (i == j) {
                    ligne.push(parseFloat(vector[i].toPrecision(2)));
                } else {
                    ligne.push(0);
                };
            }
            matrix.push(ligne)
        }
        return matrix;
    }

    transposeMatrix(matrix: number[][]): number[][] {
        return matrix[0].map((_, colIndex) => matrix.map(row => row[colIndex]));
    }

    multiplyMatrixs(matrix1: number[][], matrix2: number[][]): number[][] {
        let numberRows1 = matrix1.length,
            numberCols1 = matrix1[0].length,
            numberRows2 = matrix2.length,
            numberCols2 = matrix2[0].length,
            matrix = new Array(numberRows1);

        for (var r = 0; r < numberRows1; ++r) {
            matrix[r] = new Array(numberCols2); // initialize the current row
            for (var c = 0; c < numberCols2; ++c) {
                matrix[r][c] = 0;             // initialize the current cell
                for (var i = 0; i < numberCols1; ++i) {
                    matrix[r][c] += matrix1[r][i] * matrix2[i][c];
                }
            }
        }
        return matrix;
    }

    index_of_key_in_map(mot_cle: String): number {
        let indice: number = 0;
        for (let key of this.dictionary.keys()) {
            if (mot_cle.toLocaleUpperCase() == key) {
                return indice;
            }
            indice++;
        }
        return -1;
    }

    contient(list: String[], chaine: String): boolean {
        for (let element of list) {
            if (element.toLocaleUpperCase() == chaine)
                return true;
        }
        return false;
    }

    generator_query_vector(mot_cles: String): number[] {
        let tokens_mots_cle: String[];
        tokens_mots_cle = mot_cles.split(" ");
        let tokens_mots_cle_clean: String[] = [];
        for (var i = 0; i < tokens_mots_cle.length; i++) {
            if (tokens_mots_cle[i].length > 0) {
                tokens_mots_cle_clean.push(tokens_mots_cle[i])
            }
        }
        let query: number[] = [];
        for (let key of this.dictionary.keys()) {
            if (this.contient(tokens_mots_cle_clean, key)) {
                query.push(1);
            } else {
                query.push(0);
            }
        }
        return query;
    }

    invers_matrix(M: number[][]): number[][] {
        if (M.length !== M[0].length) { return []; }
        var i = 0, ii = 0, j = 0, dim = M.length, e = 0, t = 0;
        let I: number[][] = [], C: number[][] = [];
        for (i = 0; i < dim; i += 1) {
            // Create the row
            I[I.length] = [];
            C[C.length] = [];
            for (j = 0; j < dim; j += 1) {
                if (i == j) { I[i][j] = 1; }
                else { I[i][j] = 0; }
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
                if (e == 0) { return [] }
            }
            for (j = 0; j < dim; j++) {
                C[i][j] = C[i][j] / e;
                I[i][j] = I[i][j] / e;
            }
            for (ii = 0; ii < dim; ii++) {
                if (ii == i) { continue; }
                e = C[ii][i];
                for (j = 0; j < dim; j++) {
                    C[ii][j] -= e * C[i][j];
                    I[ii][j] -= e * I[i][j];
                }
            }
        }
        return I;
    }

    slice_matrix_verticaly(matrix: number[][]): number[][] {
        let tmp: number[][] = [];
        for (var i = 0; i < matrix.length; i++) {
            tmp.push(matrix[i].slice(0, 2));
        }
        return tmp;
    }

    transposeVector(query: number[]): number[][] {
        let tmp: number[][] = [];
        for (var i = 0; i < query.length; i++) {
            tmp.push([query[i]]);
        }
        return tmp;
    }

    multiply_vector_matrix(vector: number[], matrix: number[][]): number[] {
        let tmp: number[] = [];
        for (var i = 0; i < matrix.length; i++) {
            let res: number = 0;
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

    calcul_query_coords(q: number[], u: number[][], s: number[][]): number[] {
        let res: number[][] = [];
        let u_inv: number[][] = this.invers_matrix(u);
        res = this.multiplyMatrixs(s, u_inv);
        return this.multiply_vector_matrix(q, res);
    }

    cosinus_similarity(q: number[], d: number[]): number {
        let dot_product = ((q[0] * d[0]) + (q[1] * d[1]));
        let product_modulus = (Math.sqrt((q[0] * q[0]) + (q[1] * q[1])) * Math.sqrt((d[0] * d[0]) + (d[1] * d[1])))
        return dot_product / product_modulus;
    }

    score_documents_generator(q: number[], matrixV: number[][]): number[] {
        let tmp: number[] = [];
        for (var i = 0; i < matrixV.length; i++) {
            tmp.push(this.cosinus_similarity(q, matrixV[i]));
        }
        return tmp;
    }

    documentLinesGenerator() {
        for (var i = 0; i < this.documents.length; i++) {
            let stringLine: String[] = this.documents[i].split("\n");
            let stringRange: [String, Range][] = [];
            for (var j = 0; j < stringLine.length; j++) {
                let range: Range = new Range(new Position(j + 1, 0),
                    new Position(j + 1, stringLine.length));
                stringRange.push([stringLine[j], range]);
            }
            this.documentLinesS.set(i, stringLine);
            this.documentLinesR.set(i, stringRange);
        }
    }

    // names of the requests
    generateListNames(fileFeatures: String): String[] {
        let bankFeatures: String = fs.readFileSync(fileFeatures, 'utf8');
        let list_request: String[] = bankFeatures.split("##");
        var j = 1
        const tmp = list_request;
        let name_l: String[] = []
        while (j < tmp.length) {
            const name = tmp[j];
            name_l.push((name.replace('Name:', '').replace('\n', '').replace('\n', '').replace('\n', '').replace('\n', '').split(" "))[2])
            j += 2;
        }
        return name_l;
    }

    listRequestsGenerator(fileFeatures: String): String[] {
        let bankFeatures: String = fs.readFileSync(fileFeatures, 'utf8');
        let list_request: String[] = bankFeatures.split("##");
        let final_list_request: String[] = [];
        for (var i = 0; i < list_request.length; i++) {
            list_request[i] = list_request[i].replace('\n', ' ');
            list_request[i] = list_request[i].replace('\n', ' ');
            list_request[i] = list_request[i].replace('\n', ' ');
            list_request[i] = list_request[i].replace('\n', ' ');
            list_request[i] = list_request[i].replace('Feature Description', ' ');
            list_request[i] = list_request[i].replace('Feature Name', ' ');
            list_request[i] = list_request[i].replace(/[`~!@#$%^&*()_|+\-=?;:'",.<>\{\}\[\]\\\/]/gi, ' ');
            if (list_request[i].length > 0) {
                final_list_request.push(list_request[i]);
            }
        }
        let requests: String[] = [];
        for (var i = 0, j = 1; j < final_list_request.length; i += 2, j += 2) {
            requests.push(final_list_request[i].concat(final_list_request[j].toString()));
        }
        return requests;
    }

    lsa(dir: String, stop_file: String): void {

        this.readJson(stop_file);
        this.readRepository(dir)
        this.documentLinesGenerator();
        this.dictionary = this.dictionarygenerator(this.documents, this.stopwords);
        this.dictionary = this.removeWordsExpectIndexs(this.dictionary);
        let matrix: number[][] = [];
        matrix = this.matrix(this.dictionary, this.documents);
        matrix = this.TFIDF(matrix);
        const { u, v, q } = SVD(matrix);
        let matrixQ = this.vectorToOrthMatrix(q);
        matrixQ = this.sliceMatrixCarree(matrixQ, 0, 2);
        let matrixV = v;
        let matrixU = u;
        matrixV = this.slice_matrix_verticaly(matrixV);
        this.matrices[0] = matrixU;
        this.matrices[1] = matrixV;
        this.matrices[2] = matrixQ;


    }

    public searchFeatures(script_requests: String): [String[], Map<String, Range[]>[]] {
        this.request_file = script_requests;
        let request_list: String[] = this.listRequestsGenerator(script_requests);
        let names_list: String[] = this.generateListNames(script_requests);
        let matrixU = this.matrices[0];
        let matrixV = this.matrices[1];
        let matrixQ = this.matrices[2];

        return [names_list, this.executeListOfRequests(names_list, request_list, matrixQ, matrixU, matrixV)];
    }



    public search(request: string): Map<String, Range[]> {
        request = request.toUpperCase();

        let matrixFinal: number[][] = [];

        let matrixU = this.matrices[0];
        let matrixV = this.matrices[1];
        let matrixQ = this.matrices[2];
        request = request.toUpperCase();
        let query = this.generator_query_vector(request.toUpperCase());
        let querry_coor: number[] = this.calcul_query_coords(query, matrixQ, this.slice_matrix_verticaly(matrixU));
        console.log("querry  : ************");
        console.log(querry_coor);
        let scores = this.score_documents_generator(querry_coor, matrixV)
        // console.log("scores : " + scores);
        var name_docs = this.documents_name;
        //  console.log("names : " + name_docs);
        let pertinent_docs: [number[], String[]] = this.display_most_pertinent_documents(scores, name_docs, 0, scores.length - 1);
        console.log("pertinent_docs=================");
        console.log(pertinent_docs);
        let finalMap: Map<String, Range[]> = this.generateRangesRequest(request, pertinent_docs);
        console.log("======================================")
        console.log(finalMap)
        console.log("======================================")
        matrixFinal = this.multiplyMatrixs(matrixQ, matrixV,);
        return finalMap
    }

    coupleToList(couple: [String[], Map<String, Range[]>[]]): [String, Map<String, Range[]>][] {
        let res: [String, Map<String, Range[]>][] = [];
        for (var i = 0; i < couple[0].length; i++) {
            res.push([couple[0][i], couple[1][i]]);
        }

        return res;
    }

    executeListOfRequests(names_list: String[], request_list: String[], matrixQ: number[][], matrixU: number[][], matrixV: number[][]): Map<String, Range[]>[] {
        let listMaps: Map<String, Range[]>[] = [];
        for (var i = 0; i < request_list.length; i++) {
            var mot_cles = names_list[i];
            let query = this.generator_query_vector(mot_cles.toUpperCase());
            let querry_coor: number[] = this.calcul_query_coords(query, matrixQ, this.slice_matrix_verticaly(matrixU));
            let scores = this.score_documents_generator(querry_coor, matrixV)
            var name_docs = this.documents_name;
            let pertinent_docs: [number[], String[]] = this.display_most_pertinent_documents(scores, name_docs, 0, scores.length - 1);
            let finalMap: Map<String, Range[]> = this.generateRangesRequest(names_list[i].toUpperCase(), pertinent_docs);
            if (finalMap.size == 0) {

                var mot_cles = request_list[i];
                console.log("REQUETE" + mot_cles);
                let query = this.generator_query_vector(mot_cles.toUpperCase());
                let querry_coor: number[] = this.calcul_query_coords(query, matrixQ, this.slice_matrix_verticaly(matrixU));
                let scores = this.score_documents_generator(querry_coor, matrixV)
                var name_docs = this.documents_name;
                let pertinent_docs: [number[], String[]] = this.display_most_pertinent_documents(scores, name_docs, 0, scores.length - 1);
                let finalMap: Map<String, Range[]> = this.generateRangesRequest(request_list[i].toUpperCase(), pertinent_docs);
                listMaps.push(finalMap);
            } else {
                listMaps.push(finalMap);
            }
        }
        return listMaps;
    }



    getIdDocument(name: String): number {
        for (var i = 0; i < this.documents_name.length; i++) {
            if (this.documents_name_invar[i] == name) {
                return i;
            }
        }
        return -1;
    }

    searchRangesInDocument(request: String, list: [String, Range][]): Range[] {
        let list_range: Range[] = [];
        let tokens_request: String[] = request.split(' ');
        let tokens_mots_cle_clean: String[] = [];
        for (var i = 0; i < tokens_request.length; i++) {
            if (tokens_request[i].length > 0) {
                tokens_mots_cle_clean.push(tokens_request[i])
            }
        }
        var unique = tokens_mots_cle_clean.filter(function (elem, index, self) {
            return index === self.indexOf(elem);
        })
        for (var j = 0; j < unique.length; j++) {
            for (var i = 0; i < list.length; i++) {
                if (unique[j] == list[i][0]) {
                    list_range.push(list[i][1]);
                }
            }
        }
        return list_range
    }

    generateRangesRequest(request: String, pertinent_docs: [number[], String[]]): Map<String, Range[]> {
        let finalMap: Map<String, Range[]> = new Map<String, Range[]>();
        let list_names: String[] = pertinent_docs[1];
        let id_doc: number;
        for (var i = 0; i < list_names.length; i++) {
            if (list_names[i] != this.request_file) {
                let list_range: Range[] = [];
                id_doc = this.getIdDocument(list_names[i]);
                list_range = this.searchRangesInDocument(request, this.documentLinesR.get(id_doc)!);
                if (list_range.length > 0) {
                    finalMap.set(this.documents_name_invar[id_doc], list_range);
                }
            }
        }

        return finalMap;
    }

    readJson(fileName: String) {
        this.stopwords = JSON.parse(fs.readFileSync(fileName, 'utf8'));
    }

    partate(scores: number[], name_docs: String[], low: number, high: number): number {
        let pivot: number = scores[high];
        let i: number = (low - 1);
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
        return (i + 1)
    }

    display_most_pertinent_documents(scores: number[], name_docs: String[], low: number, high: number): [number[], String[]] {
        let tmp: [number[], String[]] = [[], []];
        tmp.pop();
        tmp.pop();
        if (low < high) {
            let p: number;
            p = this.partate(scores, name_docs, low, high);
            this.display_most_pertinent_documents(scores, name_docs, low, p - 1);
            this.display_most_pertinent_documents(scores, name_docs, p + 1, high);
        }
        tmp.push(scores);
        tmp.push(name_docs);
        return tmp;
    }

}
export { LSA }