import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AuthConfigModule } from './auth/auth-config.module';
import { HttpClientModule } from '@angular/common/http';

import { AppComponent } from './app.component';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    AuthConfigModule,
    HttpClientModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
