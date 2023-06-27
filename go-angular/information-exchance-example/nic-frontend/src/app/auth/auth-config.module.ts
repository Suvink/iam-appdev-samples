import { NgModule } from '@angular/core';
import { AuthModule, LogLevel } from 'angular-auth-oidc-client';
import { NG_APP_WELLKNOWN_URL, NG_APP_AUTHORITY_URL, NG_APP_CLIENT_ID } from '../environment/environment';

@NgModule({
    imports: [AuthModule.forRoot({
        config: {
            authority: NG_APP_AUTHORITY_URL,
            redirectUrl: window.location.origin,
            postLogoutRedirectUri: window.location.origin,
            clientId: NG_APP_CLIENT_ID,
            scope: "openid email groups profile urn:iamapptesting:nicapinicservicebe2:read_data urn:iamapptesting:nicapinicservicebe2:add_data",
            responseType: 'code',
            silentRenew: false,
            useRefreshToken: true,
            renewTimeBeforeTokenExpiresInSeconds: 30,
            authWellknownEndpointUrl: NG_APP_WELLKNOWN_URL,
            logLevel: LogLevel.Debug,
        }
    })],
    exports: [AuthModule],
})
export class AuthConfigModule { }

