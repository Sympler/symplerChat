import { jsx as _jsx } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { Widget, addResponseMessage, setQuickButtons, addUserMessage } from 'drew-react-chat-widget-custom';
import 'drew-react-chat-widget-custom/lib/styles.css';
import axios from 'axios';
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var SymplerChat = function (_a) {
    var formName = _a.formName, endpoint = _a.endpoint;
    var _b = useState(), formIoData = _b[0], setFormIoData = _b[1];
    var _c = useState([]), image = _c[0], setImage = _c[1];
    var _d = useState(false), sessionStarted = _d[0], setSessionStarted = _d[1];
    var _e = useState(false), submit = _e[0], setSubmit = _e[1];
    var _f = useState(0), index = _f[0], setIndex = _f[1];
    var _g = useState(''), formSubmissionId = _g[0], setFormSubmissionId = _g[1];
    var newDate = new Date().toString();
    var sendImageFile = function (p) { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            setImage(p);
            console.log('image has been updated', p);
            return [2 /*return*/];
        });
    }); };
    useEffect(function () {
        // {{projectUrl}}/form/{{formId}}
        axios.get("https://".concat(endpoint, ".form.io/").concat(formName)).then(function (res) {
            console.log('get results from formIo', res);
            setFormIoData(res);
        }).catch(function (error) {
            console.log('get error', error);
        });
    }, []);
    console.log('submtting?', submit);
    console.log('index', index);
    var submitData = function (message, index) { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            if (formIoData) {
                if (formIoData.data._id && sessionStarted === false) {
                    axios.get("https://".concat(endpoint, ".form.io/").concat(formName, "/submission/").concat(formIoData.data._id)).then(function (res) {
                        console.log('the res from formIo submission', res);
                    }).catch(function (error) { return __awaiter(void 0, void 0, void 0, function () {
                        var key, obj;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    console.log('get submission error error', error);
                                    key = formIoData.data.components[index].key;
                                    obj = {};
                                    obj[key] = message;
                                    console.log('first obj', obj);
                                    return [4 /*yield*/, axios.post("https://".concat(endpoint, ".form.io/").concat(formName, "/submission"), {
                                            data: __assign({}, obj)
                                        }).then(function (result) {
                                            console.log('post create submission result', result);
                                            setFormSubmissionId(result.data._id);
                                            setSessionStarted(true);
                                            setIndex(index + 1);
                                            console.log('this is running lmao');
                                            setSubmit(false);
                                        }).catch(function (error) {
                                            console.log('error', error);
                                        })];
                                case 1:
                                    _a.sent();
                                    return [2 /*return*/];
                            }
                        });
                    }); });
                }
                else if (formIoData.data._id && sessionStarted) {
                    // Get the previous submissions
                    axios.get("https://".concat(endpoint, ".form.io/").concat(formName, "/submission/").concat(formSubmissionId)).then(function (res) { return __awaiter(void 0, void 0, void 0, function () {
                        var previousData, key, obj, base64Source, base64Response, blob, file, formData;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    console.log('get previous submission', res);
                                    previousData = res.data.data;
                                    key = formIoData.data.components[index].key;
                                    obj = {};
                                    if (key === 'GDPR') {
                                        if (message !== ('Yes')) {
                                            console.log('end it here');
                                            return [2 /*return*/];
                                        }
                                    }
                                    if (!message.includes('data:')) return [3 /*break*/, 3];
                                    base64Source = message.slice(message.indexOf('(') + 1, message.lastIndexOf(')'));
                                    return [4 /*yield*/, fetch(base64Source)];
                                case 1:
                                    base64Response = _a.sent();
                                    return [4 /*yield*/, base64Response.blob()];
                                case 2:
                                    blob = _a.sent();
                                    file = new File([blob], "".concat(formIoData.data.components[index].key, "_fileUpload"));
                                    formData = new FormData();
                                    formData.append('file', file);
                                    axios.post("https://dash-api.sympler.co/api/v1/uploadimage", formData).then(function (result) {
                                        console.log('sympler result', result);
                                        var imageMessage = result.data.file;
                                        obj[key] = imageMessage;
                                        axios.put("https://".concat(endpoint, ".form.io/").concat(formName, "/submission/").concat(formSubmissionId), {
                                            data: __assign(__assign({}, obj), previousData)
                                        }).then(function (result) {
                                            console.log('result from put', result);
                                            setIndex(index + 1);
                                            setSubmit(false);
                                        }).catch(function (error) {
                                            console.log('error', error);
                                        });
                                    }).catch(function (error) {
                                        console.log('error sending the image to sympler', error);
                                    });
                                    return [3 /*break*/, 4];
                                case 3:
                                    obj[key] = message;
                                    console.log('obj on put', obj);
                                    console.log('obj previous', previousData);
                                    console.log('submission id', formIoData.data._id);
                                    axios.put("https://".concat(endpoint, ".form.io/").concat(formName, "/submission/").concat(formSubmissionId), {
                                        data: __assign(__assign({}, obj), previousData)
                                    }).then(function (result) {
                                        console.log('result from put', result);
                                        setIndex(index + 1);
                                        setSubmit(false);
                                    }).catch(function (error) {
                                        console.log('error', error);
                                    });
                                    _a.label = 4;
                                case 4: return [2 /*return*/];
                            }
                        });
                    }); }).catch(function (error) {
                        console.log('couldnt get submission', error);
                    });
                }
            }
            return [2 /*return*/];
        });
    }); };
    var askQuestion = function (message) { return __awaiter(void 0, void 0, void 0, function () {
        var _a, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    if (!formIoData) return [3 /*break*/, 7];
                    if (!(index >= (formIoData === null || formIoData === void 0 ? void 0 : formIoData.data.components.length) - 1)) return [3 /*break*/, 1];
                    console.log('all questions have been answered');
                    return [3 /*break*/, 3];
                case 1:
                    if (!formIoData.data.components[index].label.includes('GetTimeZone')) return [3 /*break*/, 3];
                    setSubmit(true);
                    return [4 /*yield*/, submitData(newDate.slice(newDate.indexOf('('), newDate.lastIndexOf(')') + 1), index)];
                case 2:
                    _c.sent();
                    return [2 /*return*/];
                case 3:
                    if (!(message && submit === false)) return [3 /*break*/, 5];
                    console.log('image', image);
                    return [4 /*yield*/, submitData(message, index)
                        // addResponseMessage(formIoData.data.components[index].label)
                    ];
                case 4:
                    _c.sent();
                    // addResponseMessage(formIoData.data.components[index].label)
                    if (formIoData.data.components[index].data) {
                        setQuickButtons((_a = formIoData.data.components[index].data.values) !== null && _a !== void 0 ? _a : []);
                    }
                    else {
                        setQuickButtons([]);
                    }
                    return [3 /*break*/, 7];
                case 5:
                    console.log('index before it adds reponse', index);
                    addResponseMessage(formIoData.data.components[index].label);
                    if (formIoData.data.components[index].data) {
                        console.log('hello why is this not working');
                        setQuickButtons((_b = formIoData.data.components[index].data.values) !== null && _b !== void 0 ? _b : []);
                    }
                    else {
                        setQuickButtons([]);
                    }
                    if (!message) return [3 /*break*/, 7];
                    console.log('askquesion is being run not insided');
                    console.log('new message', message);
                    return [4 /*yield*/, submitData(message, index)];
                case 6:
                    _c.sent();
                    _c.label = 7;
                case 7: return [2 /*return*/];
            }
        });
    }); };
    useEffect(function () {
        askQuestion();
    }, [index, formIoData]);
    // useEffect(() => {
    //   console.log('image being passed to', image)
    //   if (image.length >= 1) {
    //   }, [image])
    console.log('form', formIoData);
    var hanleQuckButtonClick = function (e) {
        addUserMessage(e);
        askQuestion(e);
    };
    useEffect(function () {
        // setQuickButtons(buttons)
        // toggleWidget()
    }, []);
    console.log('file?', image);
    return (_jsx("div", __assign({ className: "App" }, { children: _jsx(Widget, { handleNewUserMessage: askQuestion, title: "Messages", subtitle: "Chipotle Questions", handleQuickButtonClicked: hanleQuckButtonClick, emojis: false, imagePreview: true, sendImageFile: sendImageFile }) })));
};
export default SymplerChat;
