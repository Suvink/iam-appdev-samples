// Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com) All Rights Reserved.
//
// WSO2 LLC. licenses this file to you under the Apache License,
// Version 2.0 (the "License"); you may not use this file except
// in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing,
// software distributed under the License is distributed on an
// "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
// KIND, either express or implied. See the License for the
// specific language governing permissions and limitations
// under the License.

import ballerina/os;

public configurable string TOKEN_ISSUER = getFromEnvVariable("TOKEN_ISSUER", "api.asgardeo.io");
public configurable string JWKS_ENDPOINT = getFromEnvVariable("JWKS_ENDPOINT", "https://api.asgardeo.io/oauth/jwks");

function getFromEnvVariable(string envVaribale, string defaultValue) returns string {
    string envVariableVal = os:getEnv(envVaribale);
    string valueToSet = envVariableVal != "" ? envVariableVal : defaultValue;
    return valueToSet;
}
