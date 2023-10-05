/**
 * Copyright (c) 2023, WSO2 LLC. (http://www.wso2.com).
 *
 * WSO2 LLC. licenses this file to you under the Apache License,
 * Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

import { BasicUserInfo, useAuthContext } from "@asgardeo/auth-react";
import React, { FunctionComponent, ReactElement, useState } from "react";
import { Box, Tab, Button, Dialog, DialogTitle, DialogContent, DialogContentText, TextField, DialogActions, Snackbar, Alert } from "@mui/material";
import { TabContext, TabList, TabPanel } from "@mui/lab";
import { postTask } from "../api/manage/create-task";
import { Task } from "../api/type/task";
import { ListTasks } from "./ListTasks";

/**
 * Decoded ID Token Response component Prop types interface.
 */
interface MainViewPropsInterface {
    /**
     * Derived Authenticated Response.
     */
    derivedResponse?: any;
}

export interface DerivedMainViewPropsInterface {
    /**
     * Response from the `getBasicUserInfo()` function from the SDK context.
     */
    authenticateResponse: BasicUserInfo;
    /**
     * ID token split by `.`.
     */
    idToken: string[];
    /**
     * Decoded Header of the ID Token.
     */
    decodedIdTokenHeader: Record<string, unknown>;
    /**
     * Decoded Payload of the ID Token.
     */
    decodedIDTokenPayload: Record<string, unknown>;
}

function isPrivilegedUser(authenticateResponse: BasicUserInfo) {

    if (!authenticateResponse) {
        return false;
    }
    const scopes: string = authenticateResponse.allowedScopes as string;
    return scopes.includes("urn:mevanprodxghoc:taskmanagementservicemana:manage:create_tasks");
}

/**
 * Displays the derived Authentication Response from the SDK.
 *
 * @param {MainViewPropsInterface} props - Props injected to the component.
 *
 * @return {React.ReactElement}
 */
export const MainView: FunctionComponent<MainViewPropsInterface> = (
    props: MainViewPropsInterface
): ReactElement => {

    const {
        derivedResponse
    } = props;

    const { getAccessToken } = useAuthContext();
    const [title, setTitle] = useState<string>("");
    const [description, setDescription] = useState<string>("");
    const [assigedUserId, setAssigedUserId] = useState<string>("");

    const isPrivileged = isPrivilegedUser(derivedResponse?.authenticateResponse);

    const [value, setValue] = React.useState('1');

    const handleChange = (event: React.SyntheticEvent, newValue: string) => {
        setValue(newValue);
    };

    const [open, setOpen] = React.useState(false);
    const [success, setSuccess] = React.useState(false);
    const [failed, setFailed] = React.useState(false);

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const resetSnackBars = () => {
        setSuccess(false);
        setFailed(false);
    }

    const manageEndpoint = window.config.manageServiceBaseUrl;

    const handleOnSubmit = () => {
        
        async function createTask() {
            const accessToken = await getAccessToken();
            const payload: Task = {
                title: title,
                description: description,
                assignedUser: assigedUserId
            };
            const response = await postTask(manageEndpoint, accessToken, payload);
            response.status === 201 ? setSuccess(true) : setFailed(true);
        }
        createTask();
        setOpen(false);
    };

    return (
        <Box sx={{ width: '100%', typography: 'body1' }}>
        <TabContext value={value}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider', display: 'flex' }}>
            <TabList onChange={handleChange} aria-label="lab API tabs example">
                <Tab label="Assigned Tasks" value="1" />
                {isPrivileged && 
                <Tab label="Created Tasks" value="2" />
                }
            </TabList>
            { isPrivileged &&
            <Button sx={{marginLeft: 'auto'}} onClick={handleClickOpen}>Create Task</Button>
            }
            </Box>
            <TabPanel value="1"><ListTasks opertation="ListAssignedTasks"/></TabPanel>
            <TabPanel value="2"><ListTasks opertation="ListCreatedTasks"/></TabPanel>
        </TabContext>
        <Dialog open={open} onClose={handleClose}>
            <DialogTitle>Create a new task</DialogTitle>
            <DialogContent>
            <DialogContentText>
                Create a new task.
            </DialogContentText>
            <TextField
                autoFocus
                margin="dense"
                id="name"
                label="Title"
                type="text"
                fullWidth
                variant="standard"
                onChange={(e) => setTitle(e.target.value)}
            />
            <TextField
                autoFocus
                margin="dense"
                id="name"
                label="Description"
                type="text"
                fullWidth
                variant="standard"
                onChange={(e) => setDescription(e.target.value)}
            />
            <TextField
                autoFocus
                margin="dense"
                id="name"
                label="Assigned User"
                type="text"
                fullWidth
                variant="standard"
                onChange={(e) => setAssigedUserId(e.target.value)}
            />
            </DialogContent>
            <DialogActions>
            <Button onClick={handleClose}>Cancel</Button>
            <Button onClick={() => handleOnSubmit()}>Create Task</Button>
            </DialogActions>
        </Dialog>
        <Snackbar open={success} autoHideDuration={6000} onClose={resetSnackBars}>
            <Alert onClose={resetSnackBars} severity="success" sx={{ width: '100%' }}>
            Task created successfully!
            </Alert>
        </Snackbar>
        <Snackbar open={failed} autoHideDuration={6000} onClose={resetSnackBars}>
            <Alert onClose={resetSnackBars} severity="error" sx={{ width: '100%' }}>
                Task creation failed!
            </Alert>
        </Snackbar>
        </Box>  
    );
};
