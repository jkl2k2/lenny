let thesaurus = require('thesaurus');
let pluralize = require('pluralize');
let _ = require('lodash');

let commonArr = require('../data/common.json');
let customThesaurus = {
    "trump": require('../data/trump.json')
};

/**
 * splits the input string on newline and spaces, processes each word, and then joins them back together.
 * @param words
 * @param opts
 * @returns {string}
 */
function thesaurize(words, opts = {}) {
    if (typeof words !== "string") {
        throw new error("thesaurize module requires a string input for processing");
    }
    if (opts.customThesaurus) {
        _.merge(customThesaurus, opts.customThesaurus);
    }
    return words
        .split('\n')
        .map(line => {
            return line.split(' ')
                .map(word => {
                    return processWord(word);
                })
                .join(' ');
        })
        .join('\n');
}

/**
 * processes each word and attempts to find a synonym to replace it with.
 * @param word
 * @returns {*}
 */
function processWord(word) {
    let wordComponents = setWordProperties(word);
    if (wordComponents.isCommonWord) {
        return word;
    }
    wordComponents.synonym = findSynonym(wordComponents);

    return constructWord(wordComponents);
}

/**
 * returns a synonym for the input word. Preference is given to custom thesaurus first, then general thesaurus. If none are found, it returns the input base word
 * @param wordComponents
 * @returns {*}
 */
function findSynonym(wordComponents){
    return getCustomThesaurusWord(wordComponents)
        || getThesaurusWord(wordComponents)
        || wordComponents.baseWord;
}

/**
 * breaks the input 'word' into its components. Strips punctuation, determines capitalization status, plural status and common word status.
 * @param word
 * @returns {{originalWord: *, baseWord: *, punctuation: string[]}}
 */
function setWordProperties(word) {
    let wordComponents = splitPunctuation(word);
    if (wordComponents.baseWord === wordComponents.baseWord.toUpperCase()) {
        wordComponents.allCaps = true;
        wordComponents.baseWord = wordComponents.baseWord.toLowerCase();
    } else if (wordComponents.baseWord.charAt(0) === wordComponents.baseWord.charAt(0).toUpperCase()) {
        wordComponents.capitalize = true;
        wordComponents.baseWord = wordComponents.baseWord.toLowerCase();
    }

    if (pluralize.isPlural(wordComponents.baseWord) && isLetter(wordComponents.baseWord[wordComponents.baseWord.length - 2])) { // checking for apostrophe
        wordComponents.isPlural = true;
        wordComponents.baseWord = pluralize.singular(wordComponents.baseWord.toLowerCase());
    } else {
        wordComponents.isPlural = false;
    }
    wordComponents.isCommonWord = getCommonWordStatus(wordComponents);
    return wordComponents;
}

/**
 * takes all non letter characters off the front and back of a word and saves them for later reassembly.
 * @param word
 * @returns {{originalWord: *, baseWord: *, punctuation: string[]}}
 */
function splitPunctuation(word) {
    let returnObj = {
        originalWord: word,
        baseWord: word,
        punctuation: ["", ""]
    };
    while (!isLetter(returnObj.baseWord[returnObj.baseWord.length - 1]) && returnObj.baseWord.length) {
        returnObj.punctuation[1] = returnObj.baseWord.substring(returnObj.baseWord.length - 1) + returnObj.punctuation[1];
        returnObj.baseWord = returnObj.baseWord.substring(0, returnObj.baseWord.length - 1);
    }

    while (!isLetter(returnObj.baseWord[0]) && returnObj.baseWord.length) {
        returnObj.punctuation[0] = returnObj.punctuation[0] + returnObj.baseWord.substring(0, 1);
        returnObj.baseWord = returnObj.baseWord.substring(1);
    }

    return returnObj;
}

/**
 * determines if the word is included in the common word list
 * @param wordComponents
 * @returns {*}
 */
function getCommonWordStatus(wordComponents) {
    return commonArr.includes(wordComponents.baseWord.toLowerCase())
        || commonArr.includes(wordComponents.originalWord.toLowerCase());
}

/**
 * searches the thesaurus module for a synonym. The module returns an array of all synonyms, and one is randomly chosen.
 * @param wordComponents
 * @returns {string}
 */
function getThesaurusWord(wordComponents) {
    let tWordArr = thesaurus.find(wordComponents.baseWord.toLowerCase());
    if (!tWordArr.length) {
        tWordArr = thesaurus.find(wordComponents.originalWord.toLowerCase());
    }
    let tWord = chooseWord(tWordArr);
    return tWord ? tWord : '';
}

/**
 * searches the custom thesaurus for a synonym, choosing randomly from the returned array if one is found.
 * @param wordComponents
 * @returns {string}
 */
function getCustomThesaurusWord(wordComponents) {
    let customEntry = customThesaurus[wordComponents.originalWord.toLowerCase()]
        || customThesaurus[wordComponents.baseWord.toLowerCase()]
        || [];
    let tWord = chooseWord(customEntry);
    return tWord ? tWord : '';
}

/**
 * reconstructs the word based on the initial properties determined.
 * @param wordComponents
 * @returns {string}
 */
function constructWord(wordComponents) {
    if (wordComponents.isPlural) {
        wordComponents.synonym = pluralize.plural(wordComponents.synonym);
    }
    if (wordComponents.allCaps) {
        wordComponents.synonym = wordComponents.synonym.toUpperCase();
    } else if (wordComponents.capitalize) {
        wordComponents.synonym = jsUcfirst(wordComponents.synonym);
    }
    return wordComponents.punctuation[0] + wordComponents.synonym + wordComponents.punctuation[1];
}

/**
 * chooses a random word from an array.
 * @param tWordArr
 * @returns {boolean}
 */
function chooseWord(tWordArr) {
    return tWordArr.length ? tWordArr[Math.floor(Math.random() * tWordArr.length)] : false;
}

/**
 * determines if input character is a letter
 * @param c
 * @returns {boolean}
 */
function isLetter(c) {
    return c ? c.toLowerCase() != c.toUpperCase() : true;
}

/**
 * determines if the first character of a word is capitalized
 * @param string
 * @returns {string}
 */
function jsUcfirst(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

module.exports = thesaurize;
