(function(){const disabled="disabled";function XtallatX(superClass){return class extends superClass{constructor(){super(...arguments);this._evCount={}}static get observedAttributes(){return[disabled]}get disabled(){return this._disabled}set disabled(val){this.attr(disabled,val,"")}attr(name,val,trueVal){const v=val?"set":"remove";this[v+"Attribute"](name,trueVal||val)}to$(n){const mod=n%2;return(n-mod)/2+"-"+mod}incAttr(name){const ec=this._evCount;if(name in ec){ec[name]++}else{ec[name]=0}this.attr("data-"+name,this.to$(ec[name]))}attributeChangedCallback(name,oldVal,newVal){switch(name){case disabled:this._disabled=null!==newVal;break;}}de(name,detail,asIs){const eventName=name+(asIs?"":"-changed"),newEvent=new CustomEvent(eventName,{detail:detail,bubbles:!0,composed:!1});this.dispatchEvent(newEvent);this.incAttr(eventName);return newEvent}_upgradeProperties(props){props.forEach(prop=>{if(this.hasOwnProperty(prop)){let value=this[prop];delete this[prop];this[prop]=value}})}}}function BaseLinkId(superClass){return class extends superClass{get baseLinkId(){return this._baseLinkId}set baseLinkId(val){this.setAttribute("base-link-id",val)}getFullURL(tail){let r=tail;if(this._baseLinkId){const link=self[this._baseLinkId];if(link)r=link.href+r}return r}}}const store_id="store-id",save_service_url="save-service-url",persist="persist",guid="guid",master_list_id="master-list-id";class PurrSist extends BaseLinkId(XtallatX(HTMLElement)){constructor(){super(...arguments);this._initInProgress=!1}static get is(){return"purr-sist"}static get observedAttributes(){return super.observedAttributes.concat([store_id,save_service_url,persist,guid,master_list_id])}attributeChangedCallback(n,ov,nv){super.attributeChangedCallback(n,ov,nv);switch(n){case store_id:this._storeId=nv;break;case save_service_url:this._saveServiceUrl=nv;break;case master_list_id:this._masterListId=nv;break;case guid:this._guid=nv;break;case persist:this._persist=null!==nv;break;}this.onPropsChange()}get storeId(){return this._storeId}set storeId(val){this.attr(store_id,val);this.syncMasterList()}syncMasterList(){if(!this._masterListId||!this._guid)return;const master=this.getMaster();if(!master||!master.value){setTimeout(()=>{this.syncMasterList()},50);return}if(master.value[this._guid]===void 0){master.newVal={[this._guid]:this._storeId}}}pullRecFromMaster(master){if(master.value[this._guid]===void 0){this.createNew(master)}else{this.storeId=master.value[this._guid]}}createNew(master){if(this._initInProgress)return;fetch(this._saveServiceUrl,{headers:{Accept:"application/json","Content-Type":"application/json"},method:"POST",body:JSON.stringify({})}).then(resp=>{resp.json().then(json=>{this._initInProgress=!1;this.storeId=json.uri.split("/").pop();if(this._pendingNewVals){this._pendingNewVals.forEach(kvp=>{this.newVal=kvp});delete this._pendingNewVals}if(null!==master)master.newVal={[this._guid]:this._storeId}})})}set refresh(val){this.storeId=this._storeId}get saveServiceUrl(){return this._saveServiceUrl}set saveServiceUrl(val){this.attr(save_service_url,val)}get persist(){return this._persist}set persist(nv){this.attr(persist,nv,"")}get guid(){return this._guid}set guid(nv){this.attr(guid,nv)}get masterListId(){return this._masterListId}set masterListId(nv){this.attr(master_list_id,nv)}get newVal(){return this._newVal}set newVal(val){if(null===val)return;if(!this._storeId){if(!this._pendingNewVals)this._pendingNewVals=[];this._pendingNewVals.push(val);return}this._newVal=val;const value=this.value===void 0?val:Object.assign(this.value,val);fetch(this._saveServiceUrl+"/"+this._storeId,{headers:{Accept:"application/json","Content-Type":"application/json"},method:"PUT",body:JSON.stringify(value)}).then(()=>{this.setValue(value)})}connectedCallback(){this._upgradeProperties(["storeId","saveServiceUrl",persist,"disabled",guid,"masterListId"]);this.style.display="none";this._conn=!0;if(!this._saveServiceUrl){if(this._baseLinkId){this._saveServiceUrl=this.getFullURL("")}else{this._saveServiceUrl="https://api.myjson.com/bins"}}this.onPropsChange()}setValue(val){this.value=val;this.de("value",{value:val})}getMaster(){if(!this._masterListId.startsWith("/"))throw"Must start with \"/\"";return self[this._masterListId.substr(1)]}onPropsChange(){if(!this._conn||!this._saveServiceUrl||this._disabled||!this._persist)return;if(!this._storeId){if(this._masterListId){const mst=this.getMaster();if(!mst||!mst.value){setTimeout(()=>{this.onPropsChange()},50);return}this.pullRecFromMaster(mst)}else{this.createNew(null)}}else{fetch(this._saveServiceUrl+"/"+this._storeId).then(resp=>{resp.json().then(json=>{this.setValue(json)})})}}}(function(custEl){let tagName=custEl.is;if(customElements.get(tagName)){console.warn("Already registered "+tagName);return}customElements.define(tagName,custEl)})(PurrSist)})();