const _ = require("lodash");
const rewire = require("rewire");
const chai = require("chai");
const expect = chai.expect;
const sinon = require('sinon');
const sinonChai = require("sinon-chai");

chai.use(sinonChai);


describe("index.js", () => {
    let index;

    beforeEach(() => {
        index = rewire('./');
    });

    describe("happy path tests", () => {
        it("changes words that are put in", () => {
            let testSentance = "Red, purple, and blue words are gybrysh\n and far from home";
            let result = index(testSentance);
            expect(result).to.not.eql(testSentance);
        });

        it("does not change common words or unknown words", () => {
            let testSentance = "with the! use for you,\n lskdjfajjje";
            let result = index(testSentance);
            expect(result).to.eql(testSentance);
        });
    });

    describe("unit testing", () => {

        describe("thesaurize()", () => {
            let thesaurize,
                splitSpy,
                joinSpy,
                processWordStub,
                lodashMergeStub,
                customThesaurus,
                optCustomThesaurus;

            beforeEach(() => {
                thesaurize = index.__get__("thesaurize");
                customThesaurus = {"word": ["val1", "val2"]};
                optCustomThesaurus = {"word2": ["val3", "val4"]};
                splitSpy = sinon.spy(String.prototype, "split");
                joinSpy = sinon.spy(Array.prototype, "join");
                lodashMergeStub = sinon.stub(_, "merge");

                processWordStub = sinon.stub();
                index.__set__("processWord", processWordStub);

                index.__set__("customThesaurus", customThesaurus);
            });

            afterEach(() => {
                splitSpy.restore();
                joinSpy.restore();
                lodashMergeStub.restore()
            });

            it("merges the passed in custom thesaurus with the internal custom thesaurus", () => {
                thesaurize("no custom thesaurus passed");
                expect(lodashMergeStub).to.have.not.been.called;

                thesaurize("with custom thesaurus", {"customThesaurus": optCustomThesaurus});
                expect(lodashMergeStub).to.have.been.calledWith(customThesaurus, optCustomThesaurus);
            });

            it("splits the input sentence on both newline and space", () => {
                thesaurize("spaces and\n newlines");
                expect(splitSpy).to.have.been.calledWith('\n');
                expect(splitSpy).to.have.been.calledWith(' ');
            });

            it("calls processWord() for each item it splits", () => {
                thesaurize("called three\ntimes");
                expect(processWordStub).to.have.been.calledThrice;
            });
        });

        describe("processWord()", () => {
            let processWord,
                setWordProperties,
                setWordPropertiesStub,
                setWordPropertiesReturn,
                findSynonymStub,
                findSynonymReturn,
                constructWordStub,
                constructWordReturn;

            beforeEach(() => {
                processWord = index.__get__("processWord");
                setWordPropertiesReturn = {
                    "isCommonWord": false
                };
                setWordPropertiesStub = sinon.stub().returns(setWordPropertiesReturn);
                setWordProperties = index.__set__("setWordProperties", setWordPropertiesStub);

                findSynonymReturn = "smile";
                findSynonymStub = sinon.stub().returns(findSynonymReturn);
                index.__set__("findSynonym", findSynonymStub);

                constructWordReturn = "flubber";
                constructWordStub = sinon.stub().returns(constructWordReturn);
                index.__set__("constructWord", constructWordStub);
            });

            it("gets the word's properties, determines a synonym, and reconstructs the word", () => {
                let inputWord = "bounce";
                let result = processWord(inputWord);

                expect(setWordPropertiesStub).to.have.been.calledWith(inputWord);
                expect(findSynonymStub).to.have.been.calledWith(setWordPropertiesReturn);
                expect(constructWordStub).to.have.been.calledWith({ isCommonWord: false, synonym: "smile" });
                expect(result).to.eql(constructWordReturn);
            });

            it("returns the input word if it is determined to be a common word", () => {
                setWordProperties();
                setWordPropertiesReturn = {
                    "isCommonWord": true
                };
                setWordPropertiesStub = sinon.stub().returns(setWordPropertiesReturn);
                index.__set__("setWordProperties", setWordPropertiesStub);

                let inputWord = "mirror";
                expect(processWord(inputWord)).to.eql(inputWord);
            });
        });

        describe("findSynonym()", () => {
            let findSynonym,
                wordComponents,
                getCustomThesaurusWordStub,
                getThesaurusWordStub;

            beforeEach(() => {
                findSynonym = index.__get__("findSynonym");
                wordComponents = {"baseWord": "Bubbles"};
                getCustomThesaurusWordStub = sinon.stub();
                getThesaurusWordStub = sinon.stub();
            });

            it("uses getCustomThesaurusWord return if it is present", () => {
                let customWordReturn = "bookhorse";
                getCustomThesaurusWordStub = sinon.stub().returns(customWordReturn);
                index.__set__("getCustomThesaurusWord", getCustomThesaurusWordStub);
                index.__set__("getThesaurusWord", getThesaurusWordStub);

                let result = findSynonym(wordComponents);
                expect(getCustomThesaurusWordStub).to.have.been.calledWith(wordComponents);
                expect(getThesaurusWordStub).to.have.not.been.called;
                expect(result).to.eql(customWordReturn);
            });

            it("uses getThesaurusWord return if there are no custom entries", () => {
                let customWordReturn = "";
                getCustomThesaurusWordStub = sinon.stub().returns(customWordReturn);
                index.__set__("getCustomThesaurusWord", getCustomThesaurusWordStub);

                let thesaurusWord = "bookfort";
                getThesaurusWordStub = sinon.stub().returns(thesaurusWord);
                index.__set__("getThesaurusWord", getThesaurusWordStub);

                let result = findSynonym(wordComponents);
                expect(getCustomThesaurusWordStub).to.have.been.calledWith(wordComponents);
                expect(getThesaurusWordStub).to.have.been.calledWith(wordComponents);
                expect(result).to.eql(thesaurusWord);
            });

            it("defaults to the baseWord if custom and normal synonyms are not found", () => {
                let customWordReturn = "";
                getCustomThesaurusWordStub = sinon.stub().returns(customWordReturn);
                index.__set__("getCustomThesaurusWord", getCustomThesaurusWordStub);

                let thesaurusWord = "";
                getThesaurusWordStub = sinon.stub().returns(thesaurusWord);
                index.__set__("getThesaurusWord", getThesaurusWordStub);

                let result = findSynonym(wordComponents);
                expect(getCustomThesaurusWordStub).to.have.been.calledWith(wordComponents);
                expect(getThesaurusWordStub).to.have.been.calledWith(wordComponents);
                expect(result).to.eql(wordComponents.baseWord);
            });
        });

        describe("setWordProperties()", () => {
            let setWordProperties;
            beforeEach(() => {
                setWordProperties = index.__get__("setWordProperties");
            });

            it("returns correct properties for a simple word", () => {
                let word = "simple";
                let expectedComponents = {
                    "originalWord": word,
                    "baseWord": word,
                    "punctuation": ["",""],
                    "isPlural": false,
                    "isCommonWord": false
                };
                let wordComponents = setWordProperties(word);
                expect(wordComponents).to.eql(expectedComponents);
            });

            it("returns correct properties for a capitalized word with punctuation", () => {
                let word = "@@Complex!!";
                let expectedComponents = {
                    "originalWord": word,
                    "baseWord": "complex",
                    "punctuation": ["@@","!!"],
                    "capitalize": true,
                    "isPlural": false,
                    "isCommonWord": false
                };
                let wordComponents = setWordProperties(word);
                expect(wordComponents).to.eql(expectedComponents);
            });

            it("returns correct properties for plural word that is allcaps", () => {
                let word = "RUNNERS";
                let expectedComponents = {
                    "originalWord": word,
                    "baseWord": "runner",
                    "punctuation": ["",""],
                    "isPlural": true,
                    "allCaps": true,
                    "isCommonWord": false
                };
                let wordComponents = setWordProperties(word);
                expect(wordComponents).to.eql(expectedComponents);
            });
        });
    });
});