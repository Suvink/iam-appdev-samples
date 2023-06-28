import { Component, OnInit } from '@angular/core';
import { OidcSecurityService } from 'angular-auth-oidc-client';
import { AppService } from './app.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

  constructor(public oidcSecurityService: OidcSecurityService, private appService: AppService, private route: ActivatedRoute) { }

  userInfo: any = {};
  isUserAuthenticated: boolean = false;
  nicData: any[] = [];
  accessToken: string = '';
  idToken: string = '';
  urlParams: any = {};

  ngOnInit() {
    this.oidcSecurityService.checkAuth().subscribe(({ isAuthenticated, userData, idToken, accessToken }) => {
      this.isUserAuthenticated = isAuthenticated;
      this.userInfo = userData;
      localStorage.setItem('access_token', accessToken)
      this.accessToken = accessToken;
      this.idToken = idToken;
    });

    this.route.queryParams.forEach((param) => {
      this.urlParams = param;
    });

  }

  login() {
    this.oidcSecurityService.authorize();
  }

  logout() {
    localStorage.removeItem('access_token');
    this.oidcSecurityService.logoff().subscribe((result) => console.log(result));
  }

  fetchNIC() {
    if (Object.keys(this.urlParams).length !== 0 && this.urlParams['consent_status']) {
      localStorage.setItem('access_token', this.urlParams['consent_status'])
      this.appService.getNIC(this.urlParams['consent_status']).pipe().subscribe((data: any) => {
        this.nicData = data;
      })
    } else {
      this.appService.getAuthorization();
    }
  }

}
