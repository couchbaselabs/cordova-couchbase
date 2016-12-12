import { Promise } from 'es6-promise';

export class Database {

    private databaseUrl: string;
    private databaseName: string;
    private customEvent: any;

    public constructor(databaseUrl: string, databaseName: string) {
        this.databaseUrl = databaseUrl;
        this.databaseName = databaseName;
    }

    public getUrl(): string {
        return this.databaseUrl;
    }

    public createDatabase(): Promise<any> {
        return this.makeRequest("PUT", this.databaseUrl + this.databaseName);
    }

    public getDatabase(): Promise<any> {
        return this.makeRequest("GET", this.databaseUrl + this.databaseName);
    }

    public createDesignDocument(designDocumentName: string, designDocumentViews: any) {
        let data = {
            views: designDocumentViews
        };
        let designPrefix = "";
        if(designDocumentName.indexOf("_design/") === -1){
        	designPrefix = "_design/";
        }
        return this.makeRequest("PUT", this.databaseUrl + this.databaseName + "/" + designPrefix + designDocumentName, {}, data, true);
    }

    public getDesignDocument(designDocumentName: string) {
        let designPrefix = "";
        if(designDocumentName.indexOf("_design/") === -1){
        	designPrefix = "_design/";
        }
        return this.makeRequest("GET", this.databaseUrl + this.databaseName + "/" + designPrefix + designDocumentName);
    }

    public queryView(designDocumentName: string, viewName: string, options: any): Promise<any> {
        return this.makeRequest("GET", this.databaseUrl + this.databaseName + "/" + designDocumentName + "/_view/" + viewName, options);
    }

    public createDocument(jsonDocument: any): Promise<any> {
        return this.makeRequest("POST", this.databaseUrl + this.databaseName, {}, jsonDocument, true);
    }

    public createLocalDocument(documentId: string, jsonDocument: any) {
        return this.makeRequest("PUT", this.databaseUrl + this.databaseName + "/_local/" + documentId, {}, jsonDocument);
    }

    public updateDocument(documentId: string, documentRevision: string, jsonDocument: any): Promise<any> {
        return this.makeRequest("PUT", this.databaseUrl + this.databaseName + "/" + documentId, {rev: documentRevision}, jsonDocument);
    }

    public deleteDocument(documentId: string, documentRevision: string): Promise<any> {
        return this.makeRequest("DELETE", this.databaseUrl + this.databaseName + "/" + documentId, {rev: documentRevision});
    }

    public getAllDocuments() {
        return this.makeRequest("GET", this.databaseUrl + this.databaseName + "/_all_docs");
    }

    public getDocument(documentId: string): Promise<any> {
        return this.makeRequest("GET", this.databaseUrl + this.databaseName + "/" + documentId);
    }

    public getLocalDocument(documentId: string) {
        return this.makeRequest("GET", this.databaseUrl + this.databaseName + "/_local/" + documentId);
    }

    public replicate(source: string, target: string, continuous: boolean): Promise<any> {
        return this.makeRequest("POST", this.databaseUrl + "_replicate", {}, {source: source, target: target, continuous: continuous}, true);
    }

    public sync(target: string, continuous: boolean): Promise<any> {
        return this.replicate(this.databaseName, target, continuous).then(result => {
            return this.replicate(target, this.databaseName, continuous);
        });
    }

    public listen(callback: any) {
        document.addEventListener("couchbase", callback, false);
        this.poller(0);
    }

    private poller(cseq: number) {
        this.makeRequest("GET", this.databaseUrl + this.databaseName + "/_changes", {feed: "longpoll", since: cseq}, null, false, true).then((result: any) => {
            this.customEvent = new CustomEvent("couchbase", { detail: result.results });
            document.dispatchEvent(this.customEvent);
            setTimeout(() => {
                this.poller(result.last_seq);
            }, 10);
        });
    }

    public getActiveTasks() {
		return this.makeRequest("GET", this.databaseUrl + "_active_tasks");
	}

	public makeRequest(method: string, url: string, params?: any, data?: any, isJson?: boolean, withCredentials?: boolean) {
        return new Promise((resolve, reject) => {
            let xhr = new XMLHttpRequest();
            if(params) {
                url += "?" + this.serializeQueryParameters(params);
            }
            xhr.onreadystatechange = function () {
                if (xhr.readyState == 4) {
                    if (xhr.status == 200 || xhr.status == 201) {
                        resolve(JSON.parse(xhr.response));
                    } else {
                        reject(JSON.parse(xhr.response));
                    }
                }
            }
            xhr.open(method, url, true);
            if(isJson) {
                xhr.setRequestHeader("Content-Type", "application/json");
            }
            if(withCredentials) {
                xhr.withCredentials = true;
            }
            if(data) {
                xhr.send(JSON.stringify(data));
            } else {
                xhr.send();
            }
        });
	}

    private serializeQueryParameters(params: Object): string {
        let serialized: string = "";
        for(let key in params) {
            if(serialized != "") {
                serialized += "&";
            }
            serialized += key + "=" + encodeURIComponent(params[key]);
        }
        return serialized;
    }

}