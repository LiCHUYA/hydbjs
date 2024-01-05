(function(r,f){typeof exports=="object"&&typeof module<"u"?module.exports=f():typeof define=="function"&&define.amd?define(f):(r=typeof globalThis<"u"?globalThis:r||self,r.hyDB=f())})(this,function(){"use strict";function r(x,t,e){return{code:x,message:t,result:e}}class f{currentDb=null;dbs=[];isCreatingTable=!1;constructor(){this.showDBs()}async getAllDB(){return new Promise(async t=>{const e=await indexedDB.databases();Array.isArray(e)?t(r(200,"获取所有数据库成功",e)):t(r(404,"找不到数据库",{}))})}async showDBs(){try{this.dbs=await this.getAllDB()}catch(t){console.error("获取数据库失败",t)}}closeCurrentConnection(){this.currentDb&&(this.currentDb.close(),this.currentDb=null)}async useDatabase(t){return t?(this.closeCurrentConnection(),new Promise((e,n)=>{const o=window.indexedDB.open(t);o.onsuccess=s=>{try{this.currentDb=s.target.result,this.showDBs(),e(r(200,"数据库打开成功",this.currentDb))}catch(a){n({code:400,message:"数据库打开失败",data:a})}},o.onerror=async s=>{try{if(s.target.error.name==="VersionError"){const u=await this.getIndexedDBVersion(t),c=window.indexedDB.open(t,u);c.onsuccess=i=>{try{this.currentDb=i.target.result,this.showDBs(),e(this.currentDb)}catch(l){n({code:400,message:"数据库打开失败",data:l})}}}else e(r(404,"找不到表",{}))}catch(a){n({code:400,message:"数据库打开失败",data:a})}},o.onupgradeneeded=s=>{try{this.currentDb=s.target.result,e(r(200,"数据库打开成功",this.currentDb))}catch(a){n({code:400,message:"数据库打开失败",data:a})}}})):r(400,"数据库名称不能为空",{})}getIndexedDBVersion(t){return new Promise((e,n)=>{if(!t)return r(400,"数据库名称不能为空",{});const o=window.indexedDB.open(t);o.onsuccess=function(s){const a=s.target.result,u=a.version;a.close(),e(u)},o.onerror=function(s){n({code:400,message:s.target.error})}})}async getTableNames(t){return t?new Promise(async e=>{await this.useDatabase(t);const n=this.currentDb.objectStoreNames;n.length===0?e([]):e(Array.from(n))}):r(400,"数据库名称不能为空",{})}async findTableData(t,e){if(!t)return r(400,"数据库名称不能为空",{});this.isCreatingTable&&await new Promise(o=>setTimeout(o,1e3)),this.closeCurrentConnection(),await this.useDatabase(t);const n=[];if(e){if(!this.currentDb?.objectStoreNames.contains(e))return console.log(`${e} 表不存在`),this.findTableData(t);const o=this.currentDb?.transaction([e],"readonly")?.objectStore(e);if(!o)return console.log(`${t} 数据库未打开`),await this.useDatabase(t),this.findTableData(t);const s=o.getAll(),a=await new Promise((u,c)=>{s.onsuccess=i=>{const l=i.target.result;u(r(200,"查询表数据成功",l))},s.onerror=i=>{c({code:400,message:i.target.error})}});n.push({name:e,version:this.currentDb?.version||"",children:a})}else{const o=Array.from(this.currentDb?.objectStoreNames??[]);if(o.length===0)return[];for(const s of o){if(await this.useDatabase(t),!this.currentDb?.objectStoreNames.contains(s)){console.log(`${s} 表不存在`);continue}const a=this.currentDb?.transaction([s],"readonly")?.objectStore(s);if(!a)throw new Error(`${s} 数据查询失败`);const u=a.getAll(),c=await new Promise((i,l)=>{u.onsuccess=h=>{const d=h.target.result;i(d)},u.onerror=h=>{l({code:400,message:h.target.error})}});n.push({name:s||"",version:this.currentDb?.version||"",children:c})}}return n}async isTableExist(t,e){return await this.useDatabase(t),this.currentDb?.objectStoreNames.contains(e)||!1}async findByKey(t,e,n){if(!t)return r(400,"数据库名称不能为空",{});if(!e)return r(400,"表名称不能为空",{});if(!n)return r(400,"主键不能为空",{});try{return await this.isTableExist(t,e)?(await this.useDatabase(t),new Promise((s,a)=>{const c=this.currentDb.transaction(e,"readonly").objectStore(e).get(n);c.onsuccess=i=>{const l=i.target.result;s(r(200,"通过主键查询成功",l))},c.onerror=i=>{a(new Error(`查询数据失败：${i.target.error}`))}})):(console.log(`${e} 表不存在`),r(404,`${e} 表不存在`,{}))}catch(o){throw console.error("查询数据出错",o),o}}async findByIndex(t,e,n,o){if(!t)return r(400,"数据库名称不能为空",{});if(!e)return r(400,"表名称不能为空",{});if(!n)return r(400,"索引名称不能为空",{});if(!o)return r(400,"索引值不能为空",{});try{return await this.isTableExist(t,e)?(await this.useDatabase(t),new Promise((a,u)=>{const l=this.currentDb.transaction(e,"readonly").objectStore(e).index(n).get(o);l.onsuccess=h=>{const d=h.target.result;a(r(200,"通过索引查询成功",d))},l.onerror=h=>{u(new Error(`查询数据失败：${h.target.error}`))}})):(console.log(`${e} 表不存在`),r(404,`${e} 表不存在`,{}))}catch(s){throw console.error("查询数据出错",s),s}}async createTable(t,e,n){if(!t)return r(400,"数据库名称不能为空",{});if(!e)return r(400,"表名称不能为空",{});try{if(this.isCreatingTable=!0,await this.isTableExist(t,e))return console.log(r(400,`${e} 表已存在`,{})),r(400,`${e} 表已存在`,{});this.closeCurrentConnection(),await this.useDatabase(t);let s=Number(await this.getIndexedDBVersion(t))+1;return localStorage.setItem("dbVersion",s.toString()),this.currentDb&&this.currentDb.close(),new Promise((a,u)=>{const c=window.indexedDB.open(t,s);c.onsuccess=async()=>{--s,this.closeCurrentConnection(),this.showDBs(),this.isCreatingTable=!1,a({status:200,message:"创建成功",createStatus:!0})},c.onerror=i=>{u({code:400,message:i.target.error})},c.onupgradeneeded=async i=>{try{const{result:l}=i.target,h=l.createObjectStore(e,{keyPath:"id"});await new Promise((d,w)=>{n&&n.length&&n.map(g=>h.createIndex(g,g,{unique:!1})),h.transaction.oncomplete=async()=>{this.showDBs(),--s,console.log({status:200,message:"创建成功",createStatus:!0}),d({status:200,message:"创建成功",createStatus:!0})},c.onerror=g=>{w({code:400,message:g.target.error})}})}catch(l){u(l)}}})}catch(o){console.error("表创建失败",o)}}async insertOne(t,e,n){return t?(this.isCreatingTable&&await new Promise(s=>setTimeout(s,1e3)),await this.isTableExist(t,e)?(this.closeCurrentConnection(),await this.useDatabase(t),new Promise((s,a)=>{const c=this.currentDb.transaction([e],"readwrite").objectStore(e).add({id:Date.now(),...n});c.onsuccess=()=>{s({status:200,message:"插入数据成功",createStatus:!0})},c.onerror=i=>{a({code:400,message:i.target.error})}})):(console.log(`${e} 表不存在`),r(404,`${e} 表不存在`,{}))):r(400,"数据库名称不能为空",{})}async insertMany(t,e,n){return t?(this.isCreatingTable&&await new Promise(s=>setTimeout(s,1e3)),await this.isTableExist(t,e)?(this.closeCurrentConnection(),await this.useDatabase(t),new Promise(async(s,a)=>{try{const c=this.currentDb.transaction([e],"readwrite").objectStore(e);for(const i of n)await new Promise((l,h)=>{const d=c.put({id:i.id,timeStamp:Date.now(),...i});d.onsuccess=()=>{l(r(200,`${e} 数据添加成功`,{}))},d.onerror=w=>{h({code:400,message:w.target.error})}});s(r(200,`${e} 数据添加成功`,{}))}catch(u){a(u)}})):(console.log(`${e} 表不存在`),r(404,`${e} 表不存在`,{}))):r(400,"数据库名称不能为空",{})}async updateDataByPrimaryKey(t,e,n,o){return t?n?await this.isTableExist(t,e)?(this.closeCurrentConnection(),await this.useDatabase(t),new Promise(async(a,u)=>{try{const c=this.currentDb.transaction([e],"readwrite").objectStore(e),i=c.get(n);i.onsuccess=l=>{const h=l.target.result;if(h){const d={...h,...o},w=c.put(d);w.onsuccess=()=>{a({success:!0})},w.onerror=g=>{u({code:400,message:g.target.error})}}else u(new Error("数据不存在"))},i.onerror=l=>{u({code:400,message:l.target.error})}}catch(c){u(c)}})):(console.log(`${e} 表不存在`),r(404,`${e} 表不存在`,{})):r(400,"主键不能为空",{}):r(400,"数据库名称不能为空",{})}async deleteOneByPk(t,e,n){return t?await this.isTableExist(t,e)?new Promise((s,a)=>{const c=this.currentDb.transaction([e],"readwrite").objectStore(e).delete(n);c.onsuccess=()=>{s(r(200,"数据删除成功",{}))},c.onerror=i=>{a({code:400,message:i.target.error})}}):(console.log(`${e} 表不存在`),r(404,`${e} 表不存在`,{})):r(400,"数据库名称不能为空",{})}async deleteOneByIndex(t,e,n,o){return t?await this.isTableExist(t,e)?new Promise(async(a,u)=>{const l=this.currentDb.transaction([e],"readwrite").objectStore(e).index(n).openCursor(IDBKeyRange.only(o));l.onsuccess=h=>{const d=h.target.result;if(d){const w=d.delete();w.onsuccess=()=>{a(r(200,`${e} 数据删除成功`,{}))},w.onerror=g=>{u({code:400,message:g.target.error})}}},l.onerror=h=>{u(new Error(`${e} 数据删除失败 ${h}`))}}):(console.log(`${e} 表不存在`),r(404,`${e} 表不存在`,{})):r(400,"数据库名称不能为空",{})}async updateDataByIndex(t,e,n,o,s){return t?await this.isTableExist(t,e)?(this.closeCurrentConnection(),await this.useDatabase(t),new Promise(async(u,c)=>{try{const i=this.currentDb.transaction([e],"readwrite").objectStore(e),h=i.index(n).get(o);h.onsuccess=d=>{const w=d.target.result;if(w){const g={...w,...s},D=i.put(g);D.onsuccess=()=>{u({success:!0})},D.onerror=y=>{c({code:400,message:y.target.error})}}else c(new Error("数据不存在"))},h.onerror=d=>{c({code:400,message:d.target.error})}}catch(i){c(i)}})):(console.log(`${e} 表不存在`),r(404,`${e} 表不存在`,{})):r(400,"数据库名称不能为空",{})}async deleteManyByPKs(t,e,n){return t?await this.isTableExist(t,e)?new Promise((s,a)=>{const u=this.currentDb.transaction([e],"readwrite").objectStore(e),c=n.map(i=>new Promise((l,h)=>{const d=u.delete(i);d.onsuccess=()=>{l()},d.onerror=w=>{h({code:400,message:w.target.error})}}));Promise.all(c).then(()=>{s(r(200,`${n.length} 条数据删除成功`,{}))}).catch(i=>{a(new Error(`数据删除失败 ${i}`))})}):(console.log(`${e} 表不存在`),r(404,`${e} 表不存在`,{})):r(400,"数据库名称不能为空",{})}async deleteManyByIndexs(t,e,n,o){return t?await this.isTableExist(t,e)?new Promise(async(a,u)=>{const i=this.currentDb.transaction([e],"readwrite").objectStore(e).index(n),l=o.map(h=>new Promise((d,w)=>{const g=i.openCursor(IDBKeyRange.only(h));g.onsuccess=D=>{const y=D.target.result;if(y){const b=y.delete();b.onsuccess=()=>{y.continue(),d(r(200,`${e} 数据删除成功`,{}))},b.onerror=E=>{w({code:400,message:E.target.error})}}},g.onerror=D=>{w({code:400,message:D.target.error})}}));Promise.all(l).then(()=>{a(r(200,`${o.length} 条数据删除成功`,{}))}).catch(h=>{u(new Error(`${h}"数据删除失败"`))})}):(console.log(`${e} 表不存在`),r(404,`${e} 表不存在`,{})):r(400,"数据库名称不能为空",{})}deleteDatabase(t){return new Promise((e,n)=>{const o=window.indexedDB.deleteDatabase(t);o.onsuccess=()=>{e(r(200,`${t} 数据库删除成功`,{}))},o.onerror=s=>{n({code:400,message:s.target.error})}})}deleteTable(t,e){return new Promise((n,o)=>{const s=window.indexedDB.open(t);s.onsuccess=a=>{a.target.result.close();const c=window.indexedDB.deleteDatabase(t);c.onsuccess=()=>{n(r(200,`${e} 表删除成功`,{}))},c.onerror=i=>{o({code:400,message:i.target.error})}},s.onerror=()=>{o(new Error(`${t} 数据库打开失败`))}})}async deleteAllDatabases(){const e=(await this.showDBs()).map(n=>this.deleteDatabase(n.name));return Promise.all(e)}async deleteAllTables(t){await this.useDatabase(t);const n=Array.from(this.currentDb?.objectStoreNames??[]).map(o=>this.deleteTable(t,o));return Promise.all(n)}}return f});
