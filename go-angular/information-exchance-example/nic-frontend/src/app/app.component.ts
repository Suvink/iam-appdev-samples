import { Component, OnInit } from '@angular/core';
import { OidcSecurityService } from 'angular-auth-oidc-client';
import { AppService } from './app.service';
import { NG_APP_CLIENT_ID } from './environment/environment';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

  constructor(public oidcSecurityService: OidcSecurityService, private appService: AppService) { }

  userInfo: any = {};
  isUserAuthenticated: boolean = false;
  nicData: any[] = [];

  ngOnInit() {
    this.oidcSecurityService.checkAuth().subscribe(({ isAuthenticated, userData, idToken, accessToken }) => {
      this.isUserAuthenticated = isAuthenticated;
      this.userInfo = userData;
      localStorage.setItem('access_token', accessToken)
    });
    this.fetchNIC();

  }

  login() {
    this.oidcSecurityService.authorize();
  }

  logout() {
    localStorage.removeItem('access_token');
    this.oidcSecurityService.logoff().subscribe((result) => console.log(result));
  }

  fetchNIC() {
    this.appService.getNIC().pipe().subscribe((data: any) => {
      console.log(data);
      this.nicData = data;
    })
  }

  addNICValue(prop: string, value: string) {
    this.appService.addNICValue(prop, value).pipe().subscribe((data: any) => {
      console.log(data);
      this.fetchNIC();
    })
  }


  gotoSignup() {
    let url = `https://accounts.asgardeo.io/t/iamapptesting/accountrecoveryendpoint/register.do?client_id=${NG_APP_CLIENT_ID}`;
    window.location.href = url;
  }
}
