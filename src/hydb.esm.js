function s(y, t, e) {
  return {
    code: y,
    message: t,
    result: e
  };
}
class E {
  currentDb = null;
  dbs = [];
  isCreatingTable = !1;
  // private queue: (() => Promise<any>)[] = []; // 消息队列，用于存储待执行的查询数据方法
  constructor() {
    this.showDBs();
  }
  /**
   * 获取所有数据库实例
   * @returns Promise对象，包含所有数据库实例的数组
   */
  async getAllDB() {
    return new Promise(async (t) => {
      const e = await indexedDB.databases();
      Array.isArray(e) ? t(s(200, "获取所有数据库成功", e)) : t(s(404, "找不到数据库", {}));
    });
  }
  /**
   * 初始化操作，获取所有数据库实例
   */
  async showDBs() {
    try {
      this.dbs = await this.getAllDB();
    } catch (t) {
      console.error("获取数据库失败", t);
    }
  }
  /**
   * 关闭当前数据库连接
   */
  closeCurrentConnection() {
    this.currentDb && (this.currentDb.close(), this.currentDb = null);
  }
  /**
   * 使用指定的数据库
   * @param dbName 数据库名称
   * @returns Promise对象，包含当前数据库实例
   */
  async useDatabase(t) {
    return t ? (this.closeCurrentConnection(), new Promise((e, n) => {
      const o = window.indexedDB.open(t);
      o.onsuccess = (r) => {
        try {
          this.currentDb = r.target.result, this.showDBs(), e(s(200, "数据库打开成功", this.currentDb));
        } catch (a) {
          n({ code: 400, message: "数据库打开失败", data: a });
        }
      }, o.onerror = async (r) => {
        try {
          if (r.target.error.name === "VersionError") {
            const u = await this.getIndexedDBVersion(t), c = window.indexedDB.open(t, u);
            c.onsuccess = (i) => {
              try {
                this.currentDb = i.target.result, this.showDBs(), e(this.currentDb);
              } catch (l) {
                n({ code: 400, message: "数据库打开失败", data: l });
              }
            };
          } else
            e(s(404, "找不到表", {}));
        } catch (a) {
          n({ code: 400, message: "数据库打开失败", data: a });
        }
      }, o.onupgradeneeded = (r) => {
        try {
          this.currentDb = r.target.result, e(s(200, "数据库打开成功", this.currentDb));
        } catch (a) {
          n({ code: 400, message: "数据库打开失败", data: a });
        }
      };
    })) : s(400, "数据库名称不能为空", {});
  }
  /**
   * 获取指定数据库的版本号
   * @param databaseName 数据库名称
   * @returns Promise对象，包含数据库的版本号
   */
  getIndexedDBVersion(t) {
    return new Promise((e, n) => {
      if (!t)
        return s(400, "数据库名称不能为空", {});
      const o = window.indexedDB.open(t);
      o.onsuccess = function(r) {
        const a = r.target.result, u = a.version;
        a.close(), e(u);
      }, o.onerror = function(r) {
        n({ code: 400, message: r.target.error });
      };
    });
  }
  /**
   * 获取指定数据库中的表数量
   * @param dbName 数据库名称
   * @returns Promise对象，包含表名称数组
   */
  async getTableNames(t) {
    return t ? new Promise(async (e) => {
      await this.useDatabase(t);
      const n = this.currentDb.objectStoreNames;
      n.length === 0 ? e([]) : e(Array.from(n));
    }) : s(400, "数据库名称不能为空", {});
  }
  // 查询表的数据
  async findTableData(t, e) {
    if (!t)
      return s(400, "数据库名称不能为空", {});
    this.isCreatingTable && await new Promise((o) => setTimeout(o, 1e3)), this.closeCurrentConnection(), await this.useDatabase(t);
    const n = [];
    if (e) {
      if (!this.currentDb?.objectStoreNames.contains(e))
        return console.log(`${e} 表不存在`), this.findTableData(t);
      const o = this.currentDb?.transaction([e], "readonly")?.objectStore(e);
      if (!o)
        return console.log(`${t} 数据库未打开`), await this.useDatabase(t), this.findTableData(t);
      const r = o.getAll(), a = await new Promise((u, c) => {
        r.onsuccess = (i) => {
          const l = i.target.result;
          u(s(200, "查询表数据成功", l));
        }, r.onerror = (i) => {
          c({ code: 400, message: i.target.error });
        };
      });
      n.push({
        name: e,
        version: this.currentDb?.version || "",
        children: a
      });
    } else {
      const o = Array.from(
        this.currentDb?.objectStoreNames ?? []
      );
      if (o.length === 0)
        return [];
      for (const r of o) {
        if (await this.useDatabase(t), !this.currentDb?.objectStoreNames.contains(r)) {
          console.log(`${r} 表不存在`);
          continue;
        }
        const a = this.currentDb?.transaction([r], "readonly")?.objectStore(r);
        if (!a)
          throw new Error(`${r} 数据查询失败`);
        const u = a.getAll(), c = await new Promise((i, l) => {
          u.onsuccess = (h) => {
            const w = h.target.result;
            i(w);
          }, u.onerror = (h) => {
            l({ code: 400, message: h.target.error });
          };
        });
        n.push({
          name: r || "",
          version: this.currentDb?.version || "",
          children: c
        });
      }
    }
    return n;
  }
  // 判断表是否存在
  async isTableExist(t, e) {
    return await this.useDatabase(t), this.currentDb?.objectStoreNames.contains(e) || !1;
  }
  /**
   * 根据主键查询数据
   * @param dbName 数据库名称
   * @param tableName 表名称
   * @param key 主键值
   * @returns Promise对象，包含查询结果对象
   */
  async findByKey(t, e, n) {
    if (!t)
      return s(400, "数据库名称不能为空", {});
    if (!e)
      return s(400, "表名称不能为空", {});
    if (!n)
      return s(400, "主键不能为空", {});
    try {
      return await this.isTableExist(t, e) ? (await this.useDatabase(t), new Promise((r, a) => {
        const c = this.currentDb.transaction(e, "readonly").objectStore(e).get(n);
        c.onsuccess = (i) => {
          const l = i.target.result;
          r(s(200, "通过主键查询成功", l));
        }, c.onerror = (i) => {
          a(new Error(`查询数据失败：${i.target.error}`));
        };
      })) : (console.log(`${e} 表不存在`), s(404, `${e} 表不存在`, {}));
    } catch (o) {
      throw console.error("查询数据出错", o), o;
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
  async findByIndex(t, e, n, o) {
    if (!t)
      return s(400, "数据库名称不能为空", {});
    if (!e)
      return s(400, "表名称不能为空", {});
    if (!n)
      return s(400, "索引名称不能为空", {});
    if (!o)
      return s(400, "索引值不能为空", {});
    try {
      return await this.isTableExist(t, e) ? (await this.useDatabase(t), new Promise((a, u) => {
        const l = this.currentDb.transaction(e, "readonly").objectStore(e).index(n).get(o);
        l.onsuccess = (h) => {
          const w = h.target.result;
          a(s(200, "通过索引查询成功", w));
        }, l.onerror = (h) => {
          u(new Error(`查询数据失败：${h.target.error}`));
        };
      })) : (console.log(`${e} 表不存在`), s(404, `${e} 表不存在`, {}));
    } catch (r) {
      throw console.error("查询数据出错", r), r;
    }
  }
  /**
   * 创建表
   * @param dbName 数据库名称
   * @param tableName 表名称
   * @param indexs 索引数组
   * @returns Promise对象，包含创建结果的状态和状态码
   */
  async createTable(t, e, n) {
    if (!t)
      return s(400, "数据库名称不能为空", {});
    if (!e)
      return s(400, "表名称不能为空", {});
    try {
      if (this.isCreatingTable = !0, await this.isTableExist(t, e))
        return console.log(s(400, `${e} 表已存在`, {})), s(400, `${e} 表已存在`, {});
      this.closeCurrentConnection(), await this.useDatabase(t);
      let r = Number(await this.getIndexedDBVersion(t)) + 1;
      return localStorage.setItem("dbVersion", r.toString()), this.currentDb && this.currentDb.close(), new Promise((a, u) => {
        const c = window.indexedDB.open(t, r);
        c.onsuccess = async () => {
          --r, this.closeCurrentConnection(), this.showDBs(), this.isCreatingTable = !1, a({
            status: 200,
            message: "创建成功",
            createStatus: !0
          });
        }, c.onerror = (i) => {
          u({ code: 400, message: i.target.error });
        }, c.onupgradeneeded = async (i) => {
          try {
            const { result: l } = i.target, h = l.createObjectStore(e, {
              keyPath: "id"
            });
            await new Promise((w, g) => {
              n && n.length && n.map(
                (d) => h.createIndex(d, d, { unique: !1 })
              ), h.transaction.oncomplete = async () => {
                this.showDBs(), --r, console.log({
                  status: 200,
                  message: "创建成功",
                  createStatus: !0
                }), w({
                  status: 200,
                  message: "创建成功",
                  createStatus: !0
                });
              }, c.onerror = (d) => {
                g({ code: 400, message: d.target.error });
              };
            });
          } catch (l) {
            u(l);
          }
        };
      });
    } catch (o) {
      console.error("表创建失败", o);
    }
  }
  // 添加数据到指定表
  async insertOne(t, e, n) {
    return t ? (this.isCreatingTable && await new Promise((r) => setTimeout(r, 1e3)), await this.isTableExist(t, e) ? (this.closeCurrentConnection(), await this.useDatabase(t), new Promise((r, a) => {
      const c = this.currentDb.transaction([e], "readwrite").objectStore(e).add({ id: Date.now(), ...n });
      c.onsuccess = () => {
        r({
          status: 200,
          message: "插入数据成功",
          createStatus: !0
        });
      }, c.onerror = (i) => {
        a({ code: 400, message: i.target.error });
      };
    })) : (console.log(`${e} 表不存在`), s(404, `${e} 表不存在`, {}))) : s(400, "数据库名称不能为空", {});
  }
  async insertMany(t, e, n) {
    return t ? (this.isCreatingTable && await new Promise((r) => setTimeout(r, 1e3)), await this.isTableExist(t, e) ? (this.closeCurrentConnection(), await this.useDatabase(t), new Promise(async (r, a) => {
      try {
        const c = this.currentDb.transaction(
          [e],
          "readwrite"
        ).objectStore(e);
        for (const i of n)
          await new Promise((l, h) => {
            const w = c.put({
              id: i.id,
              timeStamp: Date.now(),
              ...i
            });
            w.onsuccess = () => {
              l(s(200, `${e} 数据添加成功`, {}));
            }, w.onerror = (g) => {
              h({ code: 400, message: g.target.error });
            };
          });
        r(s(200, `${e} 数据添加成功`, {}));
      } catch (u) {
        a(u);
      }
    })) : (console.log(`${e} 表不存在`), s(404, `${e} 表不存在`, {}))) : s(400, "数据库名称不能为空", {});
  }
  // 更新指定主键的数据
  async updateDataByPrimaryKey(t, e, n, o) {
    return t ? n ? await this.isTableExist(t, e) ? (this.closeCurrentConnection(), await this.useDatabase(t), new Promise(async (a, u) => {
      try {
        const c = this.currentDb.transaction([e], "readwrite").objectStore(e), i = c.get(n);
        i.onsuccess = (l) => {
          const h = l.target.result;
          if (h) {
            const w = { ...h, ...o }, g = c.put(w);
            g.onsuccess = () => {
              a({ success: !0 });
            }, g.onerror = (d) => {
              u({ code: 400, message: d.target.error });
            };
          } else
            u(new Error("数据不存在"));
        }, i.onerror = (l) => {
          u({ code: 400, message: l.target.error });
        };
      } catch (c) {
        u(c);
      }
    })) : (console.log(`${e} 表不存在`), s(404, `${e} 表不存在`, {})) : s(400, "主键不能为空", {}) : s(400, "数据库名称不能为空", {});
  }
  /**
   * 根据主键删除单条数据
   * @param dbName 数据库名称
   * @param tableName 表名称
   * @param id 主键值
   * @returns Promise对象，包含删除结果的状态和消息
   */
  async deleteOneByPk(t, e, n) {
    return t ? await this.isTableExist(t, e) ? new Promise((r, a) => {
      const c = this.currentDb.transaction([e], "readwrite").objectStore(e).delete(n);
      c.onsuccess = () => {
        r(s(200, "数据删除成功", {}));
      }, c.onerror = (i) => {
        a({ code: 400, message: i.target.error });
      };
    }) : (console.log(`${e} 表不存在`), s(404, `${e} 表不存在`, {})) : s(400, "数据库名称不能为空", {});
  }
  /**
   * 根据索引删除单条数据
   * @param dbName 数据库名称
   * @param tableName 表名称
   * @param indexName 索引名称
   * @param indexValue 索引值
   * @returns Promise对象，包含删除结果的状态和消息
   */
  async deleteOneByIndex(t, e, n, o) {
    return t ? await this.isTableExist(t, e) ? new Promise(async (a, u) => {
      const l = this.currentDb.transaction([e], "readwrite").objectStore(e).index(n).openCursor(IDBKeyRange.only(o));
      l.onsuccess = (h) => {
        const w = h.target.result;
        if (w) {
          const g = w.delete();
          g.onsuccess = () => {
            a(s(200, `${e} 数据删除成功`, {}));
          }, g.onerror = (d) => {
            u({ code: 400, message: d.target.error });
          };
        }
      }, l.onerror = (h) => {
        u(new Error(`${e} 数据删除失败 ${h}`));
      };
    }) : (console.log(`${e} 表不存在`), s(404, `${e} 表不存在`, {})) : s(400, "数据库名称不能为空", {});
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
  async updateDataByIndex(t, e, n, o, r) {
    return t ? await this.isTableExist(t, e) ? (this.closeCurrentConnection(), await this.useDatabase(t), new Promise(async (u, c) => {
      try {
        const i = this.currentDb.transaction([e], "readwrite").objectStore(e), h = i.index(n).get(o);
        h.onsuccess = (w) => {
          const g = w.target.result;
          if (g) {
            const d = { ...g, ...r }, D = i.put(d);
            D.onsuccess = () => {
              u({ success: !0 });
            }, D.onerror = (f) => {
              c({ code: 400, message: f.target.error });
            };
          } else
            c(new Error("数据不存在"));
        }, h.onerror = (w) => {
          c({ code: 400, message: w.target.error });
        };
      } catch (i) {
        c(i);
      }
    })) : (console.log(`${e} 表不存在`), s(404, `${e} 表不存在`, {})) : s(400, "数据库名称不能为空", {});
  }
  /**
   * 根据主键数组批量删除数据
   * @param dbName 数据库名称
   * @param tableName 表名称
   * @param ids 主键值数组
   * @returns Promise对象，包含删除结果的状态和消息
   */
  async deleteManyByPKs(t, e, n) {
    return t ? await this.isTableExist(t, e) ? new Promise((r, a) => {
      const u = this.currentDb.transaction([e], "readwrite").objectStore(e), c = n.map((i) => new Promise((l, h) => {
        const w = u.delete(i);
        w.onsuccess = () => {
          l();
        }, w.onerror = (g) => {
          h({ code: 400, message: g.target.error });
        };
      }));
      Promise.all(c).then(() => {
        r(s(200, `${n.length} 条数据删除成功`, {}));
      }).catch((i) => {
        a(new Error(`数据删除失败 ${i}`));
      });
    }) : (console.log(`${e} 表不存在`), s(404, `${e} 表不存在`, {})) : s(400, "数据库名称不能为空", {});
  }
  /**
   * 根据索引批量删除数据
   * @param dbName 数据库名称
   * @param tableName 表名称
   * @param indexName 索引名称
   * @param indexValues 索引值数组
   * @returns Promise对象，包含删除结果的状态和消息
   */
  async deleteManyByIndexs(t, e, n, o) {
    return t ? await this.isTableExist(t, e) ? new Promise(async (a, u) => {
      const i = this.currentDb.transaction([e], "readwrite").objectStore(e).index(n), l = o.map((h) => new Promise((w, g) => {
        const d = i.openCursor(IDBKeyRange.only(h));
        d.onsuccess = (D) => {
          const f = D.target.result;
          if (f) {
            const x = f.delete();
            x.onsuccess = () => {
              f.continue(), w(s(200, `${e} 数据删除成功`, {}));
            }, x.onerror = (b) => {
              g({ code: 400, message: b.target.error });
            };
          }
        }, d.onerror = (D) => {
          g({ code: 400, message: D.target.error });
        };
      }));
      Promise.all(l).then(() => {
        a(
          s(200, `${o.length} 条数据删除成功`, {})
        );
      }).catch((h) => {
        u(new Error(`${h}"数据删除失败"`));
      });
    }) : (console.log(`${e} 表不存在`), s(404, `${e} 表不存在`, {})) : s(400, "数据库名称不能为空", {});
  }
  /**
   * 删除指定数据库
   * @param dbName 数据库名称
   * @returns Promise对象，包含删除结果的状态和消息
   */
  deleteDatabase(t) {
    return new Promise((e, n) => {
      const o = window.indexedDB.deleteDatabase(t);
      o.onsuccess = () => {
        e(s(200, `${t} 数据库删除成功`, {}));
      }, o.onerror = (r) => {
        n({ code: 400, message: r.target.error });
      };
    });
  }
  /**
   * 删除指定表
   * @param dbName 数据库名称
   * @param tableName 表名称
   * @returns Promise对象，包含删除结果的状态和消息
   */
  deleteTable(t, e) {
    return new Promise((n, o) => {
      const r = window.indexedDB.open(t);
      r.onsuccess = (a) => {
        a.target.result.close();
        const c = window.indexedDB.deleteDatabase(t);
        c.onsuccess = () => {
          n(s(200, `${e} 表删除成功`, {}));
        }, c.onerror = (i) => {
          o({ code: 400, message: i.target.error });
        };
      }, r.onerror = () => {
        o(new Error(`${t} 数据库打开失败`));
      };
    });
  }
  /**
   * 删除所有数据库
   * @returns Promise对象，包含删除结果的状态和消息
   */
  async deleteAllDatabases() {
    const e = (await this.showDBs()).map(
      (n) => this.deleteDatabase(n.name)
    );
    return Promise.all(e);
  }
  /**
   * 删除所有表
   * @param dbName 数据库名称
   * @returns Promise对象，包含删除结果的状态和消息
   */
  async deleteAllTables(t) {
    await this.useDatabase(t);
    const n = Array.from(this.currentDb?.objectStoreNames ?? []).map(
      (o) => this.deleteTable(t, o)
    );
    return Promise.all(n);
  }
}
export {
  E as default
};
