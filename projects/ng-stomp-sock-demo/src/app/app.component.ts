import { Component, OnInit, OnDestroy } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { filter, first } from 'rxjs/operators';
import { StompSockService, StompSockWebSocket, WsCommand } from '@oril/ng-stomp-sock';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {

  public activityWS: StompSockWebSocket;
  public isConnected$: BehaviorSubject<boolean>;
  public logs: { msg: string, color?: string }[] = [];
  public page = 0;

  private _isEndpointConnected: boolean;

  constructor(
    private _webSocketService: StompSockService,
  ) {

  }

  ngOnInit() {
  }

  ngOnDestroy() {
  }

  public connectToAPI() {
    this._log('Connecting to API...');
    this.isConnected$ = this._webSocketService.connected$;
    this.isConnected$.pipe(filter(connected => !!connected))
                      .subscribe(() => {
                        this._log('API connected!', 'accent');
                      });
  }

  public connectToEndpoint() {
    this._log('Connecting to endpoint...');
    this.activityWS = this._webSocketService.getWebSocket('endpoint', { page: this.page});
    this.page++;
    this._subscribeActivity();
  }

  private _subscribeActivity() {
    this.activityWS.on<any>(WsCommand.MESSAGE)
      .subscribe(res => {
        if (!this._isEndpointConnected) {
          this._log('Endpoint connected!', 'accent');
          this._isEndpointConnected = true;
        }
        this._log(`Response: #${res.pageable.pageNumber} Page`, 'primary');
      });
  }

  public send() {
    this._log(`Requesting #${this.page} page...`);
    this.activityWS.send('request_endpoint', { page: this.page });
    this.page++;
  }

  public disconnect() {
    this.activityWS.unsubscribe();
    this.activityWS = null;
    this._log('Endpoint disconnected!', 'warn');
  }

  private _log(msg: string, color?: string) {
    this.logs.push({ msg, color });
  }
}
