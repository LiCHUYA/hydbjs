"use strict";
var __assign =
  (this && this.__assign) ||
  function () {
    __assign =
      Object.assign ||
      function (t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
          s = arguments[i];
          for (var p in s)
            if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
        }
        return t;
      };
    return __assign.apply(this, arguments);
  };
var __awaiter =
  (this && this.__awaiter) ||
  function (thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P
        ? value
        : new P(function (resolve) {
            resolve(value);
          });
    }
    return new (P || (P = Promise))(function (resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator["throw"](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done
          ? resolve(result.value)
          : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  };
var __generator =
  (this && this.__generator) ||
  function (thisArg, body) {
    var _ = {
        label: 0,
        sent: function () {
          if (t[0] & 1) throw t[1];
          return t[1];
        },
        trys: [],
        ops: [],
      },
      f,
      y,
      t,
      g;
    return (
      (g = { next: verb(0), throw: verb(1), return: verb(2) }),
      typeof Symbol === "function" &&
        (g[Symbol.iterator] = function () {
          return this;
        }),
      g
    );
    function verb(n) {
      return function (v) {
        return step([n, v]);
      };
    }
    function step(op) {
      if (f) throw new TypeError("Generator is already executing.");
      while ((g && ((g = 0), op[0] && (_ = 0)), _))
        try {
          if (
            ((f = 1),
            y &&
              (t =
                op[0] & 2
                  ? y["return"]
                  : op[0]
                  ? y["throw"] || ((t = y["return"]) && t.call(y), 0)
                  : y.next) &&
              !(t = t.call(y, op[1])).done)
          )
            return t;
          if (((y = 0), t)) op = [op[0] & 2, t.value];
          switch (op[0]) {
            case 0:
            case 1:
              t = op;
              break;
            case 4:
              _.label++;
              return { value: op[1], done: false };
            case 5:
              _.label++;
              y = op[1];
              op = [0];
              continue;
            case 7:
              op = _.ops.pop();
              _.trys.pop();
              continue;
            default:
              if (
                !((t = _.trys), (t = t.length > 0 && t[t.length - 1])) &&
                (op[0] === 6 || op[0] === 2)
              ) {
                _ = 0;
                continue;
              }
              if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) {
                _.label = op[1];
                break;
              }
              if (op[0] === 6 && _.label < t[1]) {
                _.label = t[1];
                t = op;
                break;
              }
              if (t && _.label < t[2]) {
                _.label = t[2];
                _.ops.push(op);
                break;
              }
              if (t[2]) _.ops.pop();
              _.trys.pop();
              continue;
          }
          op = body.call(thisArg, _);
        } catch (e) {
          op = [6, e];
          y = 0;
        } finally {
          f = t = 0;
        }
      if (op[0] & 5) throw op[1];
      return { value: op[0] ? op[1] : void 0, done: true };
    }
  };
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * 格式化返回结果
 * @param code 状态码
 * @param message 返回消息
 * @param result 返回数据
 * @returns 格式化后的返回结果对象
 */
function returnFormat(code, message, result) {
  return {
    code: code,
    message: message,
    result: result,
  };
}
var hydb = /** @class */ (function () {
  // private queue: (() => Promise<any>)[] = []; // 消息队列，用于存储待执行的查询数据方法
  function hydb() {
    this.currentDb = null;
    this.dbs = [];
    this.isCreatingTable = false;
    this.showDBs();
  }
  /**
   * 获取所有数据库实例
   * @returns Promise对象，包含所有数据库实例的数组
   */
  hydb.prototype.getAllDB = function () {
    return __awaiter(this, void 0, void 0, function () {
      var _this = this;
      return __generator(this, function (_a) {
        return [
          2 /*return*/,
          new Promise(function (resolve) {
            return __awaiter(_this, void 0, void 0, function () {
              var res;
              return __generator(this, function (_a) {
                switch (_a.label) {
                  case 0:
                    return [4 /*yield*/, indexedDB.databases()];
                  case 1:
                    res = _a.sent();
                    if (Array.isArray(res)) {
                      resolve(returnFormat(200, "获取所有数据库成功", res));
                    } else {
                      resolve(returnFormat(404, "找不到数据库", {}));
                    }
                    return [2 /*return*/];
                }
              });
            });
          }),
        ];
      });
    });
  };
  /**
   * 初始化操作，获取所有数据库实例
   */
  hydb.prototype.showDBs = function () {
    return __awaiter(this, void 0, void 0, function () {
      var _a, error_1;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 2, , 3]);
            _a = this;
            return [4 /*yield*/, this.getAllDB()];
          case 1:
            _a.dbs = _b.sent();
            return [3 /*break*/, 3];
          case 2:
            error_1 = _b.sent();
            console.error("获取数据库失败", error_1);
            return [3 /*break*/, 3];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * 关闭当前数据库连接
   */
  hydb.prototype.closeCurrentConnection = function () {
    if (this.currentDb) {
      this.currentDb.close();
      this.currentDb = null;
    }
  };
  /**
   * 使用指定的数据库
   * @param dbName 数据库名称
   * @returns Promise对象，包含当前数据库实例
   */
  hydb.prototype.useDatabase = function (dbName) {
    return __awaiter(this, void 0, void 0, function () {
      var _this = this;
      return __generator(this, function (_a) {
        if (!dbName) {
          return [2 /*return*/, returnFormat(400, "数据库名称不能为空", {})];
        }
        this.closeCurrentConnection();
        return [
          2 /*return*/,
          new Promise(function (resolve, reject) {
            var request = window.indexedDB.open(dbName);
            request.onsuccess = function (event) {
              try {
                _this.currentDb = event.target.result;
                _this.showDBs();
                resolve(returnFormat(200, "数据库打开成功", _this.currentDb));
              } catch (error) {
                reject({ code: 400, message: "数据库打开失败", data: error });
              }
            };
            request.onerror = function (event) {
              return __awaiter(_this, void 0, void 0, function () {
                var message, version, request_1, error_2;
                var _this = this;
                return __generator(this, function (_a) {
                  switch (_a.label) {
                    case 0:
                      _a.trys.push([0, 4, , 5]);
                      message = event.target.error.name;
                      if (!(message === "VersionError"))
                        return [3 /*break*/, 2];
                      return [4 /*yield*/, this.getIndexedDBVersion(dbName)];
                    case 1:
                      version = _a.sent();
                      request_1 = window.indexedDB.open(dbName, version);
                      request_1.onsuccess = function (event) {
                        try {
                          _this.currentDb = event.target.result;
                          _this.showDBs();
                          resolve(_this.currentDb);
                        } catch (error) {
                          reject({
                            code: 400,
                            message: "数据库打开失败",
                            data: error,
                          });
                        }
                      };
                      return [3 /*break*/, 3];
                    case 2:
                      resolve(returnFormat(404, "找不到表", {}));
                      _a.label = 3;
                    case 3:
                      return [3 /*break*/, 5];
                    case 4:
                      error_2 = _a.sent();
                      reject({
                        code: 400,
                        message: "数据库打开失败",
                        data: error_2,
                      });
                      return [3 /*break*/, 5];
                    case 5:
                      return [2 /*return*/];
                  }
                });
              });
            };
            request.onupgradeneeded = function (event) {
              try {
                _this.currentDb = event.target.result;
                resolve(returnFormat(200, "数据库打开成功", _this.currentDb));
              } catch (error) {
                reject({ code: 400, message: "数据库打开失败", data: error });
              }
            };
          }),
        ];
      });
    });
  };
  /**
   * 获取指定数据库的版本号
   * @param databaseName 数据库名称
   * @returns Promise对象，包含数据库的版本号
   */
  hydb.prototype.getIndexedDBVersion = function (databaseName) {
    return new Promise(function (resolve, reject) {
      if (!databaseName) {
        return returnFormat(400, "数据库名称不能为空", {});
      }
      var request = window.indexedDB.open(databaseName);
      request.onsuccess = function (event) {
        var db = event.target.result;
        var version = db.version;
        db.close();
        resolve(version);
      };
      request.onerror = function (event) {
        reject({ code: 400, message: event.target.error });
      };
    });
  };
  /**
   * 获取指定数据库中的表数量
   * @param dbName 数据库名称
   * @returns Promise对象，包含表名称数组
   */
  hydb.prototype.getTableNames = function (dbName) {
    return __awaiter(this, void 0, void 0, function () {
      var _this = this;
      return __generator(this, function (_a) {
        if (!dbName) {
          return [2 /*return*/, returnFormat(400, "数据库名称不能为空", {})];
        }
        return [
          2 /*return*/,
          new Promise(function (resolve) {
            return __awaiter(_this, void 0, void 0, function () {
              var objectStoreNames;
              return __generator(this, function (_a) {
                switch (_a.label) {
                  case 0:
                    return [4 /*yield*/, this.useDatabase(dbName)];
                  case 1:
                    _a.sent();
                    objectStoreNames = this.currentDb.objectStoreNames;
                    if (objectStoreNames.length === 0) {
                      resolve([]);
                    } else {
                      resolve(Array.from(objectStoreNames));
                    }
                    return [2 /*return*/];
                }
              });
            });
          }),
        ];
      });
    });
  };
  // 查询表的数据
  hydb.prototype.findTableData = function (dbName, tableName) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
    return __awaiter(this, void 0, void 0, function () {
      var result,
        store,
        request_2,
        data,
        objectStoreNames,
        _loop_1,
        this_1,
        _i,
        objectStoreNames_1,
        storeName;
      return __generator(this, function (_l) {
        switch (_l.label) {
          case 0:
            if (!dbName) {
              return [
                2 /*return*/,
                returnFormat(400, "数据库名称不能为空", {}),
              ];
            }
            if (!this.isCreatingTable) return [3 /*break*/, 2];
            return [
              4 /*yield*/,
              new Promise(function (resolve) {
                return setTimeout(resolve, 1000);
              }),
            ];
          case 1:
            _l.sent(); // 等待1秒
            _l.label = 2;
          case 2:
            this.closeCurrentConnection();
            return [4 /*yield*/, this.useDatabase(dbName)];
          case 3:
            _l.sent();
            result = [];
            if (!tableName) return [3 /*break*/, 7];
            if (
              !((_a = this.currentDb) === null || _a === void 0
                ? void 0
                : _a.objectStoreNames.contains(tableName))
            ) {
              console.log("".concat(tableName, " \u8868\u4E0D\u5B58\u5728"));
              return [2 /*return*/, this.findTableData(dbName)]; // 只传数据库名称，重新查询所有表的数据
            }
            store =
              (_c =
                (_b = this.currentDb) === null || _b === void 0
                  ? void 0
                  : _b.transaction([tableName], "readonly")) === null ||
              _c === void 0
                ? void 0
                : _c.objectStore(tableName);
            if (!!store) return [3 /*break*/, 5];
            console.log(
              "".concat(dbName, " \u6570\u636E\u5E93\u672A\u6253\u5F00")
            );
            return [4 /*yield*/, this.useDatabase(dbName)];
          case 4:
            _l.sent();
            return [2 /*return*/, this.findTableData(dbName)]; // 只传数据库名称，重新查询所有表的数据
          case 5:
            request_2 = store.getAll();
            return [
              4 /*yield*/,
              new Promise(function (resolve, reject) {
                request_2.onsuccess = function (event) {
                  var result = event.target.result;
                  resolve(returnFormat(200, "查询表数据成功", result));
                };
                request_2.onerror = function (event) {
                  reject({ code: 400, message: event.target.error });
                };
              }),
            ];
          case 6:
            data = _l.sent();
            result.push({
              name: tableName,
              version:
                ((_d = this.currentDb) === null || _d === void 0
                  ? void 0
                  : _d.version) || "",
              children: data,
            });
            return [3 /*break*/, 11];
          case 7:
            objectStoreNames = Array.from(
              (_f =
                (_e = this.currentDb) === null || _e === void 0
                  ? void 0
                  : _e.objectStoreNames) !== null && _f !== void 0
                ? _f
                : []
            );
            if (objectStoreNames.length === 0) {
              return [2 /*return*/, []];
            }
            _loop_1 = function (storeName) {
              var store, request, data;
              return __generator(this, function (_m) {
                switch (_m.label) {
                  case 0:
                    return [4 /*yield*/, this_1.useDatabase(dbName)];
                  case 1:
                    _m.sent();
                    if (
                      !((_g = this_1.currentDb) === null || _g === void 0
                        ? void 0
                        : _g.objectStoreNames.contains(storeName))
                    ) {
                      console.log(
                        "".concat(storeName, " \u8868\u4E0D\u5B58\u5728")
                      );
                      return [2 /*return*/, "continue"];
                    }
                    store =
                      (_j =
                        (_h = this_1.currentDb) === null || _h === void 0
                          ? void 0
                          : _h.transaction([storeName], "readonly")) === null ||
                      _j === void 0
                        ? void 0
                        : _j.objectStore(storeName);
                    if (!store) {
                      throw new Error(
                        "".concat(
                          storeName,
                          " \u6570\u636E\u67E5\u8BE2\u5931\u8D25"
                        )
                      );
                    }
                    request = store.getAll();
                    return [
                      4 /*yield*/,
                      new Promise(function (resolve, reject) {
                        request.onsuccess = function (event) {
                          var result = event.target.result;
                          resolve(result);
                        };
                        request.onerror = function (event) {
                          reject({ code: 400, message: event.target.error });
                        };
                      }),
                    ];
                  case 2:
                    data = _m.sent();
                    result.push({
                      name: storeName || "",
                      version:
                        ((_k = this_1.currentDb) === null || _k === void 0
                          ? void 0
                          : _k.version) || "",
                      children: data,
                    });
                    return [2 /*return*/];
                }
              });
            };
            this_1 = this;
            (_i = 0), (objectStoreNames_1 = objectStoreNames);
            _l.label = 8;
          case 8:
            if (!(_i < objectStoreNames_1.length)) return [3 /*break*/, 11];
            storeName = objectStoreNames_1[_i];
            return [5 /*yield**/, _loop_1(storeName)];
          case 9:
            _l.sent();
            _l.label = 10;
          case 10:
            _i++;
            return [3 /*break*/, 8];
          case 11:
            return [2 /*return*/, result];
        }
      });
    });
  };
  // 判断表是否存在
  hydb.prototype.isTableExist = function (dbName, tableName) {
    var _a;
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            return [4 /*yield*/, this.useDatabase(dbName)];
          case 1:
            _b.sent();
            return [
              2 /*return*/,
              ((_a = this.currentDb) === null || _a === void 0
                ? void 0
                : _a.objectStoreNames.contains(tableName)) || false,
            ];
        }
      });
    });
  };
  /**
   * 根据主键查询数据
   * @param dbName 数据库名称
   * @param tableName 表名称
   * @param key 主键值
   * @returns Promise对象，包含查询结果对象
   */
  hydb.prototype.findByKey = function (dbName, tableName, key) {
    return __awaiter(this, void 0, void 0, function () {
      var tableExist, error_3;
      var _this = this;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            if (!dbName) {
              return [
                2 /*return*/,
                returnFormat(400, "数据库名称不能为空", {}),
              ];
            }
            if (!tableName) {
              return [2 /*return*/, returnFormat(400, "表名称不能为空", {})];
            }
            if (!key) {
              return [2 /*return*/, returnFormat(400, "主键不能为空", {})];
            }
            _a.label = 1;
          case 1:
            _a.trys.push([1, 4, , 5]);
            return [4 /*yield*/, this.isTableExist(dbName, tableName)];
          case 2:
            tableExist = _a.sent();
            if (!tableExist) {
              console.log("".concat(tableName, " \u8868\u4E0D\u5B58\u5728"));
              return [
                2 /*return*/,
                returnFormat(
                  404,
                  "".concat(tableName, " \u8868\u4E0D\u5B58\u5728"),
                  {}
                ),
              ];
            }
            return [4 /*yield*/, this.useDatabase(dbName)];
          case 3:
            _a.sent();
            return [
              2 /*return*/,
              new Promise(function (resolve, reject) {
                var store = _this.currentDb
                  .transaction(tableName, "readonly")
                  .objectStore(tableName);
                var request = store.get(key);
                request.onsuccess = function (event) {
                  var result = event.target.result;
                  resolve(returnFormat(200, "通过主键查询成功", result));
                };
                request.onerror = function (event) {
                  reject(
                    new Error(
                      "\u67E5\u8BE2\u6570\u636E\u5931\u8D25\uFF1A".concat(
                        event.target.error
                      )
                    )
                  );
                };
              }),
            ];
          case 4:
            error_3 = _a.sent();
            console.error("查询数据出错", error_3);
            throw error_3;
          case 5:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * 根据索引查询数据
   * @param dbName 数据库名称
   * @param tableName 表名称
   * @param indexName 索引名称
   * @param indexValue 索引值
   * @returns Promise对象，包含查询结果对象
   */
  hydb.prototype.findByIndex = function (
    dbName,
    tableName,
    indexName,
    indexValue
  ) {
    return __awaiter(this, void 0, void 0, function () {
      var tableExist, error_4;
      var _this = this;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            if (!dbName) {
              return [
                2 /*return*/,
                returnFormat(400, "数据库名称不能为空", {}),
              ];
            }
            if (!tableName) {
              return [2 /*return*/, returnFormat(400, "表名称不能为空", {})];
            }
            if (!indexName) {
              return [2 /*return*/, returnFormat(400, "索引名称不能为空", {})];
            }
            if (!indexValue) {
              return [2 /*return*/, returnFormat(400, "索引值不能为空", {})];
            }
            _a.label = 1;
          case 1:
            _a.trys.push([1, 4, , 5]);
            return [4 /*yield*/, this.isTableExist(dbName, tableName)];
          case 2:
            tableExist = _a.sent();
            if (!tableExist) {
              console.log("".concat(tableName, " \u8868\u4E0D\u5B58\u5728"));
              return [
                2 /*return*/,
                returnFormat(
                  404,
                  "".concat(tableName, " \u8868\u4E0D\u5B58\u5728"),
                  {}
                ),
              ];
            }
            return [4 /*yield*/, this.useDatabase(dbName)];
          case 3:
            _a.sent();
            return [
              2 /*return*/,
              new Promise(function (resolve, reject) {
                var store = _this.currentDb
                  .transaction(tableName, "readonly")
                  .objectStore(tableName);
                var index = store.index(indexName);
                var request = index.get(indexValue);
                request.onsuccess = function (event) {
                  var result = event.target.result;
                  resolve(returnFormat(200, "通过索引查询成功", result));
                };
                request.onerror = function (event) {
                  reject(
                    new Error(
                      "\u67E5\u8BE2\u6570\u636E\u5931\u8D25\uFF1A".concat(
                        event.target.error
                      )
                    )
                  );
                };
              }),
            ];
          case 4:
            error_4 = _a.sent();
            console.error("查询数据出错", error_4);
            throw error_4;
          case 5:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * 创建表
   * @param dbName 数据库名称
   * @param tableName 表名称
   * @param indexs 索引数组
   * @returns Promise对象，包含创建结果的状态和状态码
   */
  hydb.prototype.createTable = function (dbName, tableName, indexs) {
    return __awaiter(this, void 0, void 0, function () {
      var tableExist, newVersion_1, _a, error_5;
      var _this = this;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            if (!dbName) {
              return [
                2 /*return*/,
                returnFormat(400, "数据库名称不能为空", {}),
              ];
            }
            if (!tableName) {
              return [2 /*return*/, returnFormat(400, "表名称不能为空", {})];
            }
            _b.label = 1;
          case 1:
            _b.trys.push([1, 5, , 6]);
            this.isCreatingTable = true;
            return [4 /*yield*/, this.isTableExist(dbName, tableName)];
          case 2:
            tableExist = _b.sent();
            if (tableExist) {
              console.log(
                returnFormat(
                  400,
                  "".concat(tableName, " \u8868\u5DF2\u5B58\u5728"),
                  {}
                )
              );
              return [
                2 /*return*/,
                returnFormat(
                  400,
                  "".concat(tableName, " \u8868\u5DF2\u5B58\u5728"),
                  {}
                ),
              ];
            }
            this.closeCurrentConnection();
            return [4 /*yield*/, this.useDatabase(dbName)];
          case 3:
            _b.sent();
            _a = Number;
            return [4 /*yield*/, this.getIndexedDBVersion(dbName)];
          case 4:
            newVersion_1 = _a.apply(void 0, [_b.sent()]) + 1;
            localStorage.setItem("dbVersion", newVersion_1.toString());
            // 关闭之前的数据库连接
            if (this.currentDb) {
              this.currentDb.close();
            }
            return [
              2 /*return*/,
              new Promise(function (resolve, reject) {
                var request = window.indexedDB.open(dbName, newVersion_1);
                request.onsuccess = function () {
                  return __awaiter(_this, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                      --newVersion_1;
                      this.closeCurrentConnection();
                      this.showDBs();
                      this.isCreatingTable = false;
                      resolve({
                        status: 200,
                        message: "创建成功",
                        createStatus: true,
                      });
                      return [2 /*return*/];
                    });
                  });
                };
                request.onerror = function (event) {
                  reject({ code: 400, message: event.target.error });
                };
                request.onupgradeneeded = function (event) {
                  return __awaiter(_this, void 0, void 0, function () {
                    var result, store_1, error_6;
                    var _this = this;
                    return __generator(this, function (_a) {
                      switch (_a.label) {
                        case 0:
                          _a.trys.push([0, 2, , 3]);
                          result = event.target.result;
                          store_1 = result.createObjectStore(tableName, {
                            keyPath: "id",
                          });
                          return [
                            4 /*yield*/,
                            new Promise(function (resolve, reject) {
                              if (indexs && indexs.length) {
                                indexs.map(function (v) {
                                  return store_1.createIndex(v, v, {
                                    unique: false,
                                  });
                                });
                              }
                              store_1.transaction.oncomplete = function () {
                                return __awaiter(
                                  _this,
                                  void 0,
                                  void 0,
                                  function () {
                                    return __generator(this, function (_a) {
                                      this.showDBs();
                                      --newVersion_1;
                                      console.log({
                                        status: 200,
                                        message: "创建成功",
                                        createStatus: true,
                                      });
                                      resolve({
                                        status: 200,
                                        message: "创建成功",
                                        createStatus: true,
                                      });
                                      return [2 /*return*/];
                                    });
                                  }
                                );
                              };
                              request.onerror = function (event) {
                                reject({
                                  code: 400,
                                  message: event.target.error,
                                });
                              };
                            }),
                          ];
                        case 1:
                          _a.sent();
                          return [3 /*break*/, 3];
                        case 2:
                          error_6 = _a.sent();
                          reject(error_6);
                          return [3 /*break*/, 3];
                        case 3:
                          return [2 /*return*/];
                      }
                    });
                  });
                };
              }),
            ];
          case 5:
            error_5 = _b.sent();
            console.error("表创建失败", error_5);
            return [3 /*break*/, 6];
          case 6:
            return [2 /*return*/];
        }
      });
    });
  };
  // 添加数据到指定表
  hydb.prototype.insertOne = function (dbName, tableName, data) {
    return __awaiter(this, void 0, void 0, function () {
      var tableExist;
      var _this = this;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            if (!dbName) {
              return [
                2 /*return*/,
                returnFormat(400, "数据库名称不能为空", {}),
              ];
            }
            if (!this.isCreatingTable) return [3 /*break*/, 2];
            return [
              4 /*yield*/,
              new Promise(function (resolve) {
                return setTimeout(resolve, 1000);
              }),
            ];
          case 1:
            _a.sent(); // 等待1秒
            _a.label = 2;
          case 2:
            return [4 /*yield*/, this.isTableExist(dbName, tableName)];
          case 3:
            tableExist = _a.sent();
            if (!tableExist) {
              console.log("".concat(tableName, " \u8868\u4E0D\u5B58\u5728"));
              return [
                2 /*return*/,
                returnFormat(
                  404,
                  "".concat(tableName, " \u8868\u4E0D\u5B58\u5728"),
                  {}
                ),
              ];
            }
            this.closeCurrentConnection();
            return [4 /*yield*/, this.useDatabase(dbName)];
          case 4:
            _a.sent();
            return [
              2 /*return*/,
              new Promise(function (resolve, reject) {
                var store = _this.currentDb
                  .transaction([tableName], "readwrite")
                  .objectStore(tableName);
                var request = store.add(__assign({ id: Date.now() }, data));
                request.onsuccess = function () {
                  resolve({
                    status: 200,
                    message: "插入数据成功",
                    createStatus: true,
                  });
                };
                request.onerror = function (event) {
                  reject({ code: 400, message: event.target.error });
                };
              }),
            ];
        }
      });
    });
  };
  hydb.prototype.insertMany = function (baseName, tableName, data) {
    return __awaiter(this, void 0, void 0, function () {
      var tableExist;
      var _this = this;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            if (!baseName) {
              return [
                2 /*return*/,
                returnFormat(400, "数据库名称不能为空", {}),
              ];
            }
            if (!this.isCreatingTable) return [3 /*break*/, 2];
            return [
              4 /*yield*/,
              new Promise(function (resolve) {
                return setTimeout(resolve, 1000);
              }),
            ];
          case 1:
            _a.sent(); // 等待1秒
            _a.label = 2;
          case 2:
            return [4 /*yield*/, this.isTableExist(baseName, tableName)];
          case 3:
            tableExist = _a.sent();
            if (!tableExist) {
              console.log("".concat(tableName, " \u8868\u4E0D\u5B58\u5728"));
              return [
                2 /*return*/,
                returnFormat(
                  404,
                  "".concat(tableName, " \u8868\u4E0D\u5B58\u5728"),
                  {}
                ),
              ];
            }
            this.closeCurrentConnection();
            return [4 /*yield*/, this.useDatabase(baseName)];
          case 4:
            _a.sent();
            return [
              2 /*return*/,
              new Promise(function (resolve, reject) {
                return __awaiter(_this, void 0, void 0, function () {
                  var writeTransaction,
                    writeStore_1,
                    _loop_2,
                    _i,
                    data_1,
                    item,
                    error_7;
                  return __generator(this, function (_a) {
                    switch (_a.label) {
                      case 0:
                        _a.trys.push([0, 5, , 6]);
                        writeTransaction = this.currentDb.transaction(
                          [tableName],
                          "readwrite"
                        );
                        writeStore_1 = writeTransaction.objectStore(tableName);
                        _loop_2 = function (item) {
                          return __generator(this, function (_b) {
                            switch (_b.label) {
                              case 0:
                                return [
                                  4 /*yield*/,
                                  new Promise(function (resolve, reject) {
                                    var request = writeStore_1.put(
                                      __assign(
                                        { id: item.id, timeStamp: Date.now() },
                                        item
                                      )
                                    );
                                    request.onsuccess = function () {
                                      resolve(
                                        returnFormat(
                                          200,
                                          "".concat(
                                            tableName,
                                            " \u6570\u636E\u6DFB\u52A0\u6210\u529F"
                                          ),
                                          {}
                                        )
                                      );
                                    };
                                    request.onerror = function (event) {
                                      reject({
                                        code: 400,
                                        message: event.target.error,
                                      });
                                    };
                                  }),
                                ];
                              case 1:
                                _b.sent();
                                return [2 /*return*/];
                            }
                          });
                        };
                        (_i = 0), (data_1 = data);
                        _a.label = 1;
                      case 1:
                        if (!(_i < data_1.length)) return [3 /*break*/, 4];
                        item = data_1[_i];
                        return [5 /*yield**/, _loop_2(item)];
                      case 2:
                        _a.sent();
                        _a.label = 3;
                      case 3:
                        _i++;
                        return [3 /*break*/, 1];
                      case 4:
                        resolve(
                          returnFormat(
                            200,
                            "".concat(
                              tableName,
                              " \u6570\u636E\u6DFB\u52A0\u6210\u529F"
                            ),
                            {}
                          )
                        );
                        return [3 /*break*/, 6];
                      case 5:
                        error_7 = _a.sent();
                        reject(error_7);
                        return [3 /*break*/, 6];
                      case 6:
                        return [2 /*return*/];
                    }
                  });
                });
              }),
            ];
        }
      });
    });
  };
  // 更新指定主键的数据
  hydb.prototype.updateDataByPrimaryKey = function (
    dbName,
    storeName,
    id,
    data
  ) {
    return __awaiter(this, void 0, void 0, function () {
      var tableExist;
      var _this = this;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            if (!dbName) {
              return [
                2 /*return*/,
                returnFormat(400, "数据库名称不能为空", {}),
              ];
            }
            if (!id) {
              return [2 /*return*/, returnFormat(400, "主键不能为空", {})];
            }
            return [4 /*yield*/, this.isTableExist(dbName, storeName)];
          case 1:
            tableExist = _a.sent();
            if (!tableExist) {
              console.log("".concat(storeName, " \u8868\u4E0D\u5B58\u5728"));
              return [
                2 /*return*/,
                returnFormat(
                  404,
                  "".concat(storeName, " \u8868\u4E0D\u5B58\u5728"),
                  {}
                ),
              ];
            }
            // 关闭当前连接
            this.closeCurrentConnection();
            // 使用指定的数据库
            return [4 /*yield*/, this.useDatabase(dbName)];
          case 2:
            // 使用指定的数据库
            _a.sent();
            return [
              2 /*return*/,
              new Promise(function (resolve, reject) {
                return __awaiter(_this, void 0, void 0, function () {
                  var store_2, request;
                  return __generator(this, function (_a) {
                    try {
                      store_2 = this.currentDb
                        .transaction([storeName], "readwrite")
                        .objectStore(storeName);
                      request = store_2.get(id);
                      request.onsuccess = function (event) {
                        var item = event.target.result;
                        if (item) {
                          var updatedItem = __assign(__assign({}, item), data);
                          var updateRequest = store_2.put(updatedItem);
                          updateRequest.onsuccess = function () {
                            resolve({ success: true });
                          };
                          updateRequest.onerror = function (event) {
                            reject({ code: 400, message: event.target.error });
                          };
                        } else {
                          reject(new Error("数据不存在"));
                        }
                      };
                      request.onerror = function (event) {
                        reject({ code: 400, message: event.target.error });
                      };
                    } catch (error) {
                      reject(error);
                    }
                    return [2 /*return*/];
                  });
                });
              }),
            ];
        }
      });
    });
  };
  /**
   * 根据主键删除单条数据
   * @param dbName 数据库名称
   * @param tableName 表名称
   * @param id 主键值
   * @returns Promise对象，包含删除结果的状态和消息
   */
  hydb.prototype.deleteOneByPk = function (dbName, tableName, id) {
    return __awaiter(this, void 0, void 0, function () {
      var tableExist;
      var _this = this;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            if (!dbName) {
              return [
                2 /*return*/,
                returnFormat(400, "数据库名称不能为空", {}),
              ];
            }
            return [4 /*yield*/, this.isTableExist(dbName, tableName)];
          case 1:
            tableExist = _a.sent();
            if (!tableExist) {
              console.log("".concat(tableName, " \u8868\u4E0D\u5B58\u5728"));
              return [
                2 /*return*/,
                returnFormat(
                  404,
                  "".concat(tableName, " \u8868\u4E0D\u5B58\u5728"),
                  {}
                ),
              ];
            }
            return [
              2 /*return*/,
              new Promise(function (resolve, reject) {
                var store = _this.currentDb
                  .transaction([tableName], "readwrite")
                  .objectStore(tableName);
                var request = store.delete(id);
                request.onsuccess = function () {
                  resolve(
                    returnFormat(
                      200,
                      "\u6570\u636E\u5220\u9664\u6210\u529F",
                      {}
                    )
                  );
                };
                request.onerror = function (event) {
                  reject({ code: 400, message: event.target.error });
                };
              }),
            ];
        }
      });
    });
  };
  /**
   * 根据索引删除单条数据
   * @param dbName 数据库名称
   * @param tableName 表名称
   * @param indexName 索引名称
   * @param indexValue 索引值
   * @returns Promise对象，包含删除结果的状态和消息
   */
  hydb.prototype.deleteOneByIndex = function (
    dbName,
    tableName,
    indexName,
    indexValue
  ) {
    return __awaiter(this, void 0, void 0, function () {
      var tableExist;
      var _this = this;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            if (!dbName) {
              return [
                2 /*return*/,
                returnFormat(400, "数据库名称不能为空", {}),
              ];
            }
            return [4 /*yield*/, this.isTableExist(dbName, tableName)];
          case 1:
            tableExist = _a.sent();
            if (!tableExist) {
              console.log("".concat(tableName, " \u8868\u4E0D\u5B58\u5728"));
              return [
                2 /*return*/,
                returnFormat(
                  404,
                  "".concat(tableName, " \u8868\u4E0D\u5B58\u5728"),
                  {}
                ),
              ];
            }
            return [
              2 /*return*/,
              new Promise(function (resolve, reject) {
                return __awaiter(_this, void 0, void 0, function () {
                  var store, index, request;
                  return __generator(this, function (_a) {
                    store = this.currentDb
                      .transaction([tableName], "readwrite")
                      .objectStore(tableName);
                    index = store.index(indexName);
                    request = index.openCursor(IDBKeyRange.only(indexValue));
                    request.onsuccess = function (event) {
                      var cursor = event.target.result;
                      if (cursor) {
                        var deleteRequest = cursor.delete();
                        deleteRequest.onsuccess = function () {
                          resolve(
                            returnFormat(
                              200,
                              "".concat(
                                tableName,
                                " \u6570\u636E\u5220\u9664\u6210\u529F"
                              ),
                              {}
                            )
                          );
                        };
                        deleteRequest.onerror = function (event) {
                          reject({ code: 400, message: event.target.error });
                        };
                      }
                    };
                    request.onerror = function (e) {
                      reject(
                        new Error(
                          ""
                            .concat(
                              tableName,
                              " \u6570\u636E\u5220\u9664\u5931\u8D25 "
                            )
                            .concat(e)
                        )
                      );
                    };
                    return [2 /*return*/];
                  });
                });
              }),
            ];
        }
      });
    });
  };
  /**
   * 根据索引更新数据
   * @param baseName 数据库名称
   * @param storeName 存储对象的名称
   * @param indexName 索引名称
   * @param indexValue 索引值
   * @param data 要更新的数据对象
   * @returns Promise 包含成功或失败的结果
   */
  hydb.prototype.updateDataByIndex = function (
    baseName,
    storeName,
    indexName,
    indexValue,
    data
  ) {
    return __awaiter(this, void 0, void 0, function () {
      var tableExist;
      var _this = this;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            if (!baseName) {
              return [
                2 /*return*/,
                returnFormat(400, "数据库名称不能为空", {}),
              ];
            }
            return [4 /*yield*/, this.isTableExist(baseName, storeName)];
          case 1:
            tableExist = _a.sent();
            if (!tableExist) {
              console.log("".concat(storeName, " \u8868\u4E0D\u5B58\u5728"));
              return [
                2 /*return*/,
                returnFormat(
                  404,
                  "".concat(storeName, " \u8868\u4E0D\u5B58\u5728"),
                  {}
                ),
              ];
            }
            // 关闭当前连接
            this.closeCurrentConnection();
            // 使用指定的数据库
            return [4 /*yield*/, this.useDatabase(baseName)];
          case 2:
            // 使用指定的数据库
            _a.sent();
            return [
              2 /*return*/,
              new Promise(function (resolve, reject) {
                return __awaiter(_this, void 0, void 0, function () {
                  var store_3, index, request;
                  return __generator(this, function (_a) {
                    try {
                      store_3 = this.currentDb
                        .transaction([storeName], "readwrite")
                        .objectStore(storeName);
                      index = store_3.index(indexName);
                      request = index.get(indexValue);
                      request.onsuccess = function (event) {
                        var item = event.target.result;
                        if (item) {
                          var updatedItem = __assign(__assign({}, item), data);
                          var updateRequest = store_3.put(updatedItem);
                          updateRequest.onsuccess = function () {
                            resolve({ success: true });
                          };
                          updateRequest.onerror = function (event) {
                            reject({ code: 400, message: event.target.error });
                          };
                        } else {
                          reject(new Error("数据不存在"));
                        }
                      };
                      request.onerror = function (event) {
                        reject({ code: 400, message: event.target.error });
                      };
                    } catch (error) {
                      reject(error);
                    }
                    return [2 /*return*/];
                  });
                });
              }),
            ];
        }
      });
    });
  };
  /**
   * 根据主键数组批量删除数据
   * @param dbName 数据库名称
   * @param tableName 表名称
   * @param ids 主键值数组
   * @returns Promise对象，包含删除结果的状态和消息
   */
  hydb.prototype.deleteManyByPKs = function (dbName, tableName, ids) {
    return __awaiter(this, void 0, void 0, function () {
      var tableExist;
      var _this = this;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            if (!dbName) {
              return [
                2 /*return*/,
                returnFormat(400, "数据库名称不能为空", {}),
              ];
            }
            return [4 /*yield*/, this.isTableExist(dbName, tableName)];
          case 1:
            tableExist = _a.sent();
            if (!tableExist) {
              console.log("".concat(tableName, " \u8868\u4E0D\u5B58\u5728"));
              return [
                2 /*return*/,
                returnFormat(
                  404,
                  "".concat(tableName, " \u8868\u4E0D\u5B58\u5728"),
                  {}
                ),
              ];
            }
            return [
              2 /*return*/,
              new Promise(function (resolve, reject) {
                var store = _this.currentDb
                  .transaction([tableName], "readwrite")
                  .objectStore(tableName);
                var deletePromises = ids.map(function (id) {
                  return new Promise(function (resolve, reject) {
                    var request = store.delete(id);
                    request.onsuccess = function () {
                      resolve();
                    };
                    request.onerror = function (event) {
                      reject({ code: 400, message: event.target.error });
                    };
                  });
                });
                Promise.all(deletePromises)
                  .then(function () {
                    resolve(
                      returnFormat(
                        200,
                        "".concat(
                          ids.length,
                          " \u6761\u6570\u636E\u5220\u9664\u6210\u529F"
                        ),
                        {}
                      )
                    );
                  })
                  .catch(function (error) {
                    reject(
                      new Error(
                        "\u6570\u636E\u5220\u9664\u5931\u8D25 ".concat(error)
                      )
                    );
                  });
              }),
            ];
        }
      });
    });
  };
  /**
   * 根据索引批量删除数据
   * @param dbName 数据库名称
   * @param tableName 表名称
   * @param indexName 索引名称
   * @param indexValues 索引值数组
   * @returns Promise对象，包含删除结果的状态和消息
   */
  hydb.prototype.deleteManyByIndexs = function (
    dbName,
    tableName,
    indexName,
    indexValues
  ) {
    return __awaiter(this, void 0, void 0, function () {
      var tableExist;
      var _this = this;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            if (!dbName) {
              return [
                2 /*return*/,
                returnFormat(400, "数据库名称不能为空", {}),
              ];
            }
            return [4 /*yield*/, this.isTableExist(dbName, tableName)];
          case 1:
            tableExist = _a.sent();
            if (!tableExist) {
              console.log("".concat(tableName, " \u8868\u4E0D\u5B58\u5728"));
              return [
                2 /*return*/,
                returnFormat(
                  404,
                  "".concat(tableName, " \u8868\u4E0D\u5B58\u5728"),
                  {}
                ),
              ];
            }
            return [
              2 /*return*/,
              new Promise(function (resolve, reject) {
                return __awaiter(_this, void 0, void 0, function () {
                  var store, index, deletePromises;
                  return __generator(this, function (_a) {
                    store = this.currentDb
                      .transaction([tableName], "readwrite")
                      .objectStore(tableName);
                    index = store.index(indexName);
                    deletePromises = indexValues.map(function (value) {
                      return new Promise(function (resolve, reject) {
                        var request = index.openCursor(IDBKeyRange.only(value));
                        request.onsuccess = function (event) {
                          var cursor = event.target.result;
                          if (cursor) {
                            var deleteRequest = cursor.delete();
                            deleteRequest.onsuccess = function () {
                              cursor.continue();
                              resolve(
                                returnFormat(
                                  200,
                                  "".concat(
                                    tableName,
                                    " \u6570\u636E\u5220\u9664\u6210\u529F"
                                  ),
                                  {}
                                )
                              );
                            };
                            deleteRequest.onerror = function (event) {
                              reject({
                                code: 400,
                                message: event.target.error,
                              });
                            };
                          }
                        };
                        request.onerror = function (event) {
                          reject({ code: 400, message: event.target.error });
                        };
                      });
                    });
                    Promise.all(deletePromises)
                      .then(function () {
                        resolve(
                          returnFormat(
                            200,
                            "".concat(
                              indexValues.length,
                              " \u6761\u6570\u636E\u5220\u9664\u6210\u529F"
                            ),
                            {}
                          )
                        );
                      })
                      .catch(function (error) {
                        reject(
                          new Error(
                            "".concat(
                              error,
                              '"\u6570\u636E\u5220\u9664\u5931\u8D25"'
                            )
                          )
                        );
                      });
                    return [2 /*return*/];
                  });
                });
              }),
            ];
        }
      });
    });
  };
  /**
   * 删除指定数据库
   * @param dbName 数据库名称
   * @returns Promise对象，包含删除结果的状态和消息
   */
  hydb.prototype.deleteDatabase = function (dbName) {
    return new Promise(function (resolve, reject) {
      var request = window.indexedDB.deleteDatabase(dbName);
      request.onsuccess = function () {
        resolve(
          returnFormat(
            200,
            "".concat(dbName, " \u6570\u636E\u5E93\u5220\u9664\u6210\u529F"),
            {}
          )
        );
      };
      request.onerror = function (event) {
        reject({ code: 400, message: event.target.error });
      };
    });
  };
  /**
   * 删除指定表
   * @param dbName 数据库名称
   * @param tableName 表名称
   * @returns Promise对象，包含删除结果的状态和消息
   */
  hydb.prototype.deleteTable = function (dbName, tableName) {
    return new Promise(function (resolve, reject) {
      var request = window.indexedDB.open(dbName);
      request.onsuccess = function (event) {
        var db = event.target.result;
        db.close();
        var deleteRequest = window.indexedDB.deleteDatabase(dbName);
        deleteRequest.onsuccess = function () {
          resolve(
            returnFormat(
              200,
              "".concat(tableName, " \u8868\u5220\u9664\u6210\u529F"),
              {}
            )
          );
        };
        deleteRequest.onerror = function (event) {
          reject({ code: 400, message: event.target.error });
        };
      };
      request.onerror = function () {
        reject(
          new Error(
            "".concat(dbName, " \u6570\u636E\u5E93\u6253\u5F00\u5931\u8D25")
          )
        );
      };
    });
  };
  /**
   * 删除所有数据库
   * @returns Promise对象，包含删除结果的状态和消息
   */
  hydb.prototype.deleteAllDatabases = function () {
    return __awaiter(this, void 0, void 0, function () {
      var allDatabases, deletePromises;
      var _this = this;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            return [4 /*yield*/, this.showDBs()];
          case 1:
            allDatabases = _a.sent();
            deletePromises = allDatabases.map(function (db) {
              return _this.deleteDatabase(db.name);
            });
            return [2 /*return*/, Promise.all(deletePromises)];
        }
      });
    });
  };
  /**
   * 删除所有表
   * @param dbName 数据库名称
   * @returns Promise对象，包含删除结果的状态和消息
   */
  hydb.prototype.deleteAllTables = function (dbName) {
    var _a, _b;
    return __awaiter(this, void 0, void 0, function () {
      var objectStoreNames, deletePromises;
      var _this = this;
      return __generator(this, function (_c) {
        switch (_c.label) {
          case 0:
            return [4 /*yield*/, this.useDatabase(dbName)];
          case 1:
            _c.sent();
            objectStoreNames = Array.from(
              (_b =
                (_a = this.currentDb) === null || _a === void 0
                  ? void 0
                  : _a.objectStoreNames) !== null && _b !== void 0
                ? _b
                : []
            );
            deletePromises = objectStoreNames.map(function (tableName) {
              return _this.deleteTable(dbName, tableName);
            });
            return [2 /*return*/, Promise.all(deletePromises)];
        }
      });
    });
  };
  return hydb;
})();
// exports.default = hydb;
