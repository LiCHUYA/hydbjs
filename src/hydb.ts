/**
 * 格式化返回结果
 * @param code 状态码
 * @param message 返回消息
 * @param result 返回数据
 * @returns 格式化后的返回结果对象
 */
function returnFormat(code: number, message: string, result: any) {
  return {
    code,
    message,
    result,
  };
}

class hydb {
  private currentDb: any = null;
  public dbs: any = [];
  private isCreatingTable: boolean = false;
  // private queue: (() => Promise<any>)[] = []; // 消息队列，用于存储待执行的查询数据方法
  constructor() {
    this.showDBs();
  }

  /**
   * 获取所有数据库实例
   * @returns Promise对象，包含所有数据库实例的数组
   */
  private async getAllDB(): Promise<any> {
    return new Promise<any>(async (resolve) => {
      const res = await indexedDB.databases();
      if (Array.isArray(res)) {
        resolve(returnFormat(200, "获取所有数据库成功", res));
      } else {
        resolve(returnFormat(404, "找不到数据库", {}));
      }
    });
  }

  /**
   * 初始化操作，获取所有数据库实例
   */
  async showDBs(): Promise<void> {
    try {
      this.dbs = await this.getAllDB();
    } catch (error) {
      console.error("获取数据库失败", error);
    }
  }

  /**
   * 关闭当前数据库连接
   */
  private closeCurrentConnection(): void {
    if (this.currentDb) {
      this.currentDb.close();
      this.currentDb = null;
    }
  }

  /**
   * 使用指定的数据库
   * @param dbName 数据库名称
   * @returns Promise对象，包含当前数据库实例
   */
  async useDatabase(dbName: string) {
    if (!dbName) {
      return returnFormat(400, "数据库名称不能为空", {});
    }
    this.closeCurrentConnection();
    return new Promise<any>((resolve, reject) => {
      const request = window.indexedDB.open(dbName);

      request.onsuccess = (event: any) => {
        try {
          this.currentDb = event.target.result;
          this.showDBs();
          resolve(returnFormat(200, "数据库打开成功", this.currentDb));
        } catch (error) {
          reject({ code: 400, message: "数据库打开失败", data: error });
        }
      };

      request.onerror = async (event: any) => {
        try {
          const message = event.target.error.name;
          if (message === "VersionError") {
            const version = await this.getIndexedDBVersion(dbName);
            const request = window.indexedDB.open(dbName, version);
            request.onsuccess = (event: any) => {
              try {
                this.currentDb = event.target.result;
                this.showDBs();
                resolve(this.currentDb);
              } catch (error) {
                reject({ code: 400, message: "数据库打开失败", data: error });
              }
            };
          } else {
            resolve(returnFormat(404, "找不到表", {}));
          }
        } catch (error) {
          reject({ code: 400, message: "数据库打开失败", data: error });
        }
      };

      request.onupgradeneeded = (event: any) => {
        try {
          this.currentDb = event.target.result;
          resolve(returnFormat(200, "数据库打开成功", this.currentDb));
        } catch (error) {
          reject({ code: 400, message: "数据库打开失败", data: error });
        }
      };
    });
  }

  /**
   * 获取指定数据库的版本号
   * @param databaseName 数据库名称
   * @returns Promise对象，包含数据库的版本号
   */
  getIndexedDBVersion(databaseName: string): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      if (!databaseName) {
        return returnFormat(400, "数据库名称不能为空", {});
      }
      const request = window.indexedDB.open(databaseName);
      request.onsuccess = function (event: any) {
        const db: any = event.target.result;
        const version = db.version;
        db.close();
        resolve(version);
      };
      request.onerror = function (event: any) {
        reject({ code: 400, message: event.target.error });
      };
    });
  }

  /**
   * 获取指定数据库中的表数量
   * @param dbName 数据库名称
   * @returns Promise对象，包含表名称数组
   */
  async getTableNames(dbName: string): Promise<any> {
    if (!dbName) {
      return returnFormat(400, "数据库名称不能为空", {});
    }
    return new Promise<any>(async (resolve) => {
      await this.useDatabase(dbName);
      const objectStoreNames = this.currentDb.objectStoreNames;

      if (objectStoreNames.length === 0) {
        resolve([]);
      } else {
        resolve(Array.from(objectStoreNames));
      }
    });
  }

  // 查询表的数据
  async findTableData(dbName: string, tableName?: string): Promise<any> {
    if (!dbName) {
      return returnFormat(400, "数据库名称不能为空", {});
    }
    if (this.isCreatingTable) {
      await new Promise((resolve) => setTimeout(resolve, 1000)); // 等待1秒
    }

    this.closeCurrentConnection();
    await this.useDatabase(dbName);
    const result: any[] = [];

    if (tableName) {
      if (!this.currentDb?.objectStoreNames.contains(tableName)) {
        console.log(`${tableName} 表不存在`);
        return this.findTableData(dbName); // 只传数据库名称，重新查询所有表的数据
      }

      const store = this.currentDb
        ?.transaction([tableName], "readonly")
        ?.objectStore(tableName);

      if (!store) {
        console.log(`${dbName} 数据库未打开`);
        await this.useDatabase(dbName);
        return this.findTableData(dbName); // 只传数据库名称，重新查询所有表的数据
      }

      const request = store.getAll();
      const data = await new Promise<any>((resolve, reject) => {
        request.onsuccess = (event: any) => {
          const result = event.target.result;
          resolve(returnFormat(200, "查询表数据成功", result));
        };

        request.onerror = (event: any) => {
          reject({ code: 400, message: event.target.error });
        };
      });

      result.push({
        name: tableName,
        version: this.currentDb?.version || "",
        children: data,
      });
    } else {
      const objectStoreNames = Array.from(
        this.currentDb?.objectStoreNames ?? []
      );

      if (objectStoreNames.length === 0) {
        return [];
      }

      for (const storeName of objectStoreNames) {
        await this.useDatabase(dbName);

        if (!this.currentDb?.objectStoreNames.contains(storeName)) {
          console.log(`${storeName} 表不存在`);
          continue; // 继续下一次循环
        }

        const store = this.currentDb
          ?.transaction([storeName], "readonly")
          ?.objectStore(storeName);

        if (!store) {
          throw new Error(`${storeName} 数据查询失败`);
        }

        const request = store.getAll();
        const data = await new Promise<any[]>((resolve, reject) => {
          request.onsuccess = (event: any) => {
            const result = event.target.result;
            resolve(result);
          };
          request.onerror = (event: any) => {
            reject({ code: 400, message: event.target.error });
          };
        });

        result.push({
          name: storeName || "",
          version: this.currentDb?.version || "",
          children: data,
        });
      }
    }

    return result;
  }

  // 判断表是否存在
  private async isTableExist(dbName: string, tableName: string): Promise<any> {
    await this.useDatabase(dbName);
    return this.currentDb?.objectStoreNames.contains(tableName) || false;
  }

  /**
   * 根据主键查询数据
   * @param dbName 数据库名称
   * @param tableName 表名称
   * @param key 主键值
   * @returns Promise对象，包含查询结果对象
   */
  async findByKey(dbName: string, tableName: string, key: any): Promise<any> {
    if (!dbName) {
      return returnFormat(400, "数据库名称不能为空", {});
    }
    if (!tableName) {
      return returnFormat(400, "表名称不能为空", {});
    }
    if (!key) {
      return returnFormat(400, "主键不能为空", {});
    }
    try {
      const tableExist = await this.isTableExist(dbName, tableName);
      if (!tableExist) {
        console.log(`${tableName} 表不存在`);
        return returnFormat(404, `${tableName} 表不存在`, {});
      }

      await this.useDatabase(dbName);

      return new Promise<any>((resolve, reject) => {
        const store = this.currentDb
          .transaction(tableName, "readonly")
          .objectStore(tableName);
        const request = store.get(key);

        request.onsuccess = (event: any) => {
          const result = event.target.result;
          resolve(returnFormat(200, "通过主键查询成功", result));
        };

        request.onerror = (event: any) => {
          reject(new Error(`查询数据失败：${event.target.error}`));
        };
      });
    } catch (error) {
      console.error("查询数据出错", error);
      throw error;
    }
  }

  /**
   * 根据索引查询数据
   * @param dbName 数据库名称
   * @param tableName 表名称
   * @param indexName 索引名称
   * @param indexValue 索引值
   * @returns Promise对象，包含查询结果对象
   */
  async findByIndex(
    dbName: string,
    tableName: string,
    indexName: string,
    indexValue: any
  ): Promise<any> {
    if (!dbName) {
      return returnFormat(400, "数据库名称不能为空", {});
    }

    if (!tableName) {
      return returnFormat(400, "表名称不能为空", {});
    }

    if (!indexName) {
      return returnFormat(400, "索引名称不能为空", {});
    }

    if (!indexValue) {
      return returnFormat(400, "索引值不能为空", {});
    }
    try {
      const tableExist = await this.isTableExist(dbName, tableName);
      if (!tableExist) {
        console.log(`${tableName} 表不存在`);
        return returnFormat(404, `${tableName} 表不存在`, {});
      }

      await this.useDatabase(dbName);

      return new Promise<any>((resolve, reject) => {
        const store = this.currentDb
          .transaction(tableName, "readonly")
          .objectStore(tableName);
        const index = store.index(indexName);
        const request = index.get(indexValue);

        request.onsuccess = (event: any) => {
          const result = event.target.result;
          resolve(returnFormat(200, "通过索引查询成功", result));
        };

        request.onerror = (event: any) => {
          reject(new Error(`查询数据失败：${event.target.error}`));
        };
      });
    } catch (error) {
      console.error("查询数据出错", error);
      throw error;
    }
  }

  /**
   * 创建表
   * @param dbName 数据库名称
   * @param tableName 表名称
   * @param indexs 索引数组
   * @returns Promise对象，包含创建结果的状态和状态码
   */
  async createTable(dbName: string, tableName: string, indexs: any[]) {
    if (!dbName) {
      return returnFormat(400, "数据库名称不能为空", {});
    }

    if (!tableName) {
      return returnFormat(400, "表名称不能为空", {});
    }
    try {
      this.isCreatingTable = true;
      const tableExist = await this.isTableExist(dbName, tableName);
      if (tableExist) {
        console.log(returnFormat(400, `${tableName} 表已存在`, {}));
        return returnFormat(400, `${tableName} 表已存在`, {});
      }

      this.closeCurrentConnection();
      await this.useDatabase(dbName);
      let newVersion = Number(await this.getIndexedDBVersion(dbName)) + 1;
      localStorage.setItem("dbVersion", newVersion.toString());

      // 关闭之前的数据库连接
      if (this.currentDb) {
        this.currentDb.close();
      }

      return new Promise<any>((resolve, reject) => {
        const request = window.indexedDB.open(dbName, newVersion);

        request.onsuccess = async () => {
          --newVersion;
          this.closeCurrentConnection();
          this.showDBs();
          this.isCreatingTable = false;
          resolve({
            status: 200,
            message: "创建成功",
            createStatus: true,
          });
        };

        request.onerror = (event: any) => {
          reject({ code: 400, message: event.target.error });
        };
        request.onupgradeneeded = async (event: any) => {
          try {
            const { result } = event.target;
            const store = result.createObjectStore(tableName, {
              keyPath: "id",
            });

            await new Promise<any>((resolve, reject) => {
              if (indexs && indexs.length) {
                indexs.map((v: string) =>
                  store.createIndex(v, v, { unique: false })
                );
              }
              store.transaction.oncomplete = async () => {
                this.showDBs();
                --newVersion;
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
              };

              request.onerror = (event: any) => {
                reject({ code: 400, message: event.target.error });
              };
            });
          } catch (error) {
            reject(error);
          }
        };
      });
    } catch (error) {
      console.error("表创建失败", error);
      // throw error;
    }
  }

  // 添加数据到指定表
  async insertOne<T>(dbName: string, tableName: string, data: T) {
    if (!dbName) {
      return returnFormat(400, "数据库名称不能为空", {});
    }
    if (this.isCreatingTable) {
      await new Promise((resolve) => setTimeout(resolve, 1000)); // 等待1秒
    }
    const tableExist = await this.isTableExist(dbName, tableName);
    if (!tableExist) {
      console.log(`${tableName} 表不存在`);
      return returnFormat(404, `${tableName} 表不存在`, {});
    }

    this.closeCurrentConnection();
    await this.useDatabase(dbName);

    return new Promise<any>((resolve, reject) => {
      const store = this.currentDb
        .transaction([tableName], "readwrite")
        .objectStore(tableName);
      const request = store.add({ id: Date.now(), ...data });

      request.onsuccess = () => {
        resolve({
          status: 200,
          message: "插入数据成功",
          createStatus: true,
        });
      };

      request.onerror = (event: any) => {
        reject({ code: 400, message: event.target.error });
      };
    });
  }

  async insertMany(baseName: any, tableName: string, data: any[]) {
    if (!baseName) {
      return returnFormat(400, "数据库名称不能为空", {});
    }
    if (this.isCreatingTable) {
      await new Promise((resolve) => setTimeout(resolve, 1000)); // 等待1秒
    }
    const tableExist = await this.isTableExist(baseName, tableName);
    if (!tableExist) {
      console.log(`${tableName} 表不存在`);
      return returnFormat(404, `${tableName} 表不存在`, {});
    }

    this.closeCurrentConnection();
    await this.useDatabase(baseName);

    return new Promise(async (resolve, reject) => {
      try {
        const writeTransaction = this.currentDb.transaction(
          [tableName],
          "readwrite"
        );
        const writeStore = writeTransaction.objectStore(tableName);

        for (const item of data) {
          await new Promise<any>((resolve, reject) => {
            const request = writeStore.put({
              id: item.id,
              timeStamp: Date.now(),
              ...item,
            });

            request.onsuccess = () => {
              resolve(returnFormat(200, `${tableName} 数据添加成功`, {}));
            };

            request.onerror = (event: any) => {
              reject({ code: 400, message: event.target.error });
            };
          });
        }

        resolve(returnFormat(200, `${tableName} 数据添加成功`, {}));
      } catch (error) {
        reject(error);
      }
    });
  }

  // 更新指定主键的数据
  async updateDataByPrimaryKey<T>(
    dbName: any,
    storeName: string,
    id: number,
    data: T
  ): Promise<any> {
    if (!dbName) {
      return returnFormat(400, "数据库名称不能为空", {});
    }
    if (!id) {
      return returnFormat(400, "主键不能为空", {});
    }
    const tableExist = await this.isTableExist(dbName, storeName);
    if (!tableExist) {
      console.log(`${storeName} 表不存在`);
      return returnFormat(404, `${storeName} 表不存在`, {});
    }

    // 关闭当前连接
    this.closeCurrentConnection();
    // 使用指定的数据库
    await this.useDatabase(dbName);

    return new Promise<any>(async (resolve, reject) => {
      try {
        const store = this.currentDb
          .transaction([storeName], "readwrite")
          .objectStore(storeName);
        const request = store.get(id);

        request.onsuccess = (event: any) => {
          const item = event.target.result;
          if (item) {
            const updatedItem = { ...item, ...data };
            const updateRequest = store.put(updatedItem);

            updateRequest.onsuccess = () => {
              resolve({ success: true });
            };

            updateRequest.onerror = (event: any) => {
              reject({ code: 400, message: event.target.error });
            };
          } else {
            reject(new Error("数据不存在"));
          }
        };

        request.onerror = (event: any) => {
          reject({ code: 400, message: event.target.error });
        };
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * 根据主键删除单条数据
   * @param dbName 数据库名称
   * @param tableName 表名称
   * @param id 主键值
   * @returns Promise对象，包含删除结果的状态和消息
   */
  async deleteOneByPk(dbName: string, tableName: string, id: number) {
    if (!dbName) {
      return returnFormat(400, "数据库名称不能为空", {});
    }
    const tableExist = await this.isTableExist(dbName, tableName);
    if (!tableExist) {
      console.log(`${tableName} 表不存在`);
      return returnFormat(404, `${tableName} 表不存在`, {});
    }

    return new Promise<any>((resolve, reject) => {
      const store = this.currentDb
        .transaction([tableName], "readwrite")
        .objectStore(tableName);

      const request = store.delete(id);
      request.onsuccess = () => {
        resolve(returnFormat(200, `数据删除成功`, {}));
      };
      request.onerror = (event: any) => {
        reject({ code: 400, message: event.target.error });
      };
    });
  }

  /**
   * 根据索引删除单条数据
   * @param dbName 数据库名称
   * @param tableName 表名称
   * @param indexName 索引名称
   * @param indexValue 索引值
   * @returns Promise对象，包含删除结果的状态和消息
   */
  async deleteOneByIndex(
    dbName: string,
    tableName: string,
    indexName: string,
    indexValue: any
  ) {
    if (!dbName) {
      return returnFormat(400, "数据库名称不能为空", {});
    }
    const tableExist = await this.isTableExist(dbName, tableName);
    if (!tableExist) {
      console.log(`${tableName} 表不存在`);
      return returnFormat(404, `${tableName} 表不存在`, {});
    }

    return new Promise<any>(async (resolve, reject) => {
      const store = this.currentDb
        .transaction([tableName], "readwrite")
        .objectStore(tableName);
      const index = store.index(indexName);

      const request = index.openCursor(IDBKeyRange.only(indexValue));
      request.onsuccess = (event: any) => {
        const cursor = event.target.result;
        if (cursor) {
          const deleteRequest = cursor.delete();
          deleteRequest.onsuccess = () => {
            resolve(returnFormat(200, `${tableName} 数据删除成功`, {}));
          };
          deleteRequest.onerror = (event: any) => {
            reject({ code: 400, message: event.target.error });
          };
        }
      };
      request.onerror = (e: any) => {
        reject(new Error(`${tableName} 数据删除失败 ${e}`));
      };
    });
  }

  /**
   * 根据索引更新数据
   * @param baseName 数据库名称
   * @param storeName 存储对象的名称
   * @param indexName 索引名称
   * @param indexValue 索引值
   * @param data 要更新的数据对象
   * @returns Promise 包含成功或失败的结果
   */
  async updateDataByIndex<T>(
    baseName: any,
    storeName: string,
    indexName: string,
    indexValue: any,
    data: T
  ): Promise<any> {
    if (!baseName) {
      return returnFormat(400, "数据库名称不能为空", {});
    }
    const tableExist = await this.isTableExist(baseName, storeName);
    if (!tableExist) {
      console.log(`${storeName} 表不存在`);
      return returnFormat(404, `${storeName} 表不存在`, {});
    }

    // 关闭当前连接
    this.closeCurrentConnection();

    // 使用指定的数据库
    await this.useDatabase(baseName);

    return new Promise<any>(async (resolve, reject) => {
      try {
        const store = this.currentDb
          .transaction([storeName], "readwrite")
          .objectStore(storeName);
        const index = store.index(indexName);
        const request = index.get(indexValue);

        request.onsuccess = (event: any) => {
          const item = event.target.result;
          if (item) {
            const updatedItem = { ...item, ...data };
            const updateRequest = store.put(updatedItem);

            updateRequest.onsuccess = () => {
              resolve({ success: true });
            };

            updateRequest.onerror = (event: any) => {
              reject({ code: 400, message: event.target.error });
            };
          } else {
            reject(new Error("数据不存在"));
          }
        };

        request.onerror = (event: any) => {
          reject({ code: 400, message: event.target.error });
        };
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * 根据主键数组批量删除数据
   * @param dbName 数据库名称
   * @param tableName 表名称
   * @param ids 主键值数组
   * @returns Promise对象，包含删除结果的状态和消息
   */
  async deleteManyByPKs(dbName: string, tableName: string, ids: number[]) {
    if (!dbName) {
      return returnFormat(400, "数据库名称不能为空", {});
    }
    const tableExist = await this.isTableExist(dbName, tableName);
    if (!tableExist) {
      console.log(`${tableName} 表不存在`);
      return returnFormat(404, `${tableName} 表不存在`, {});
    }

    return new Promise<any>((resolve, reject) => {
      const store = this.currentDb
        .transaction([tableName], "readwrite")
        .objectStore(tableName);

      const deletePromises = ids.map((id) => {
        return new Promise<void>((resolve, reject) => {
          const request = store.delete(id);
          request.onsuccess = () => {
            resolve();
          };
          request.onerror = (event: any) => {
            reject({ code: 400, message: event.target.error });
          };
        });
      });

      Promise.all(deletePromises)
        .then(() => {
          resolve(returnFormat(200, `${ids.length} 条数据删除成功`, {}));
        })
        .catch((error) => {
          reject(new Error(`数据删除失败 ${error}`));
        });
    });
  }

  /**
   * 根据索引批量删除数据
   * @param dbName 数据库名称
   * @param tableName 表名称
   * @param indexName 索引名称
   * @param indexValues 索引值数组
   * @returns Promise对象，包含删除结果的状态和消息
   */
  async deleteManyByIndexs(
    dbName: string,
    tableName: string,
    indexName: string,
    indexValues: any[]
  ) {
    if (!dbName) {
      return returnFormat(400, "数据库名称不能为空", {});
    }
    const tableExist = await this.isTableExist(dbName, tableName);
    if (!tableExist) {
      console.log(`${tableName} 表不存在`);
      return returnFormat(404, `${tableName} 表不存在`, {});
    }

    return new Promise<any>(async (resolve, reject) => {
      const store = this.currentDb
        .transaction([tableName], "readwrite")
        .objectStore(tableName);
      const index = store.index(indexName);

      const deletePromises = indexValues.map((value) => {
        return new Promise<any>((resolve, reject) => {
          const request = index.openCursor(IDBKeyRange.only(value));
          request.onsuccess = (event: any) => {
            const cursor = event.target.result;
            if (cursor) {
              const deleteRequest = cursor.delete();
              deleteRequest.onsuccess = () => {
                cursor.continue();
                resolve(returnFormat(200, `${tableName} 数据删除成功`, {}));
              };
              deleteRequest.onerror = (event: any) => {
                reject({ code: 400, message: event.target.error });
              };
            }
          };
          request.onerror = (event: any) => {
            reject({ code: 400, message: event.target.error });
          };
        });
      });

      Promise.all(deletePromises)
        .then(() => {
          resolve(
            returnFormat(200, `${indexValues.length} 条数据删除成功`, {})
          );
        })
        .catch((error) => {
          reject(new Error(`${error}"数据删除失败"`));
        });
    });
  }

  /**
   * 删除指定数据库
   * @param dbName 数据库名称
   * @returns Promise对象，包含删除结果的状态和消息
   */
  deleteDatabase(dbName: string): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      const request = window.indexedDB.deleteDatabase(dbName);

      request.onsuccess = () => {
        resolve(returnFormat(200, `${dbName} 数据库删除成功`, {}));
      };

      request.onerror = (event: any) => {
        reject({ code: 400, message: event.target.error });
      };
    });
  }

  /**
   * 删除指定表
   * @param dbName 数据库名称
   * @param tableName 表名称
   * @returns Promise对象，包含删除结果的状态和消息
   */
  deleteTable(dbName: string, tableName: string): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      const request = window.indexedDB.open(dbName);

      request.onsuccess = (event: any) => {
        const db = event.target.result;
        db.close();

        const deleteRequest = window.indexedDB.deleteDatabase(dbName);

        deleteRequest.onsuccess = () => {
          resolve(returnFormat(200, `${tableName} 表删除成功`, {}));
        };

        deleteRequest.onerror = (event: any) => {
          reject({ code: 400, message: event.target.error });
        };
      };

      request.onerror = () => {
        reject(new Error(`${dbName} 数据库打开失败`));
      };
    });
  }

  /**
   * 删除所有数据库
   * @returns Promise对象，包含删除结果的状态和消息
   */
  async deleteAllDatabases() {
    const allDatabases: any = await this.showDBs();

    const deletePromises = allDatabases.map((db: any) =>
      this.deleteDatabase(db.name)
    );

    return Promise.all(deletePromises);
  }

  /**
   * 删除所有表
   * @param dbName 数据库名称
   * @returns Promise对象，包含删除结果的状态和消息
   */
  async deleteAllTables(dbName: string): Promise<any> {
    await this.useDatabase(dbName);

    const objectStoreNames = Array.from(this.currentDb?.objectStoreNames ?? []);

    const deletePromises = objectStoreNames.map((tableName: any) =>
      this.deleteTable(dbName, tableName)
    );

    return Promise.all(deletePromises);
  }
}
export default hydb;
