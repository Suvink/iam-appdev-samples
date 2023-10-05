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

import { useAuthContext } from "@asgardeo/auth-react";
import { TableContainer, Paper, Table, TableHead, TableRow, TableCell, TableBody } from "@mui/material";
import React, { useEffect, useState } from "react";
import { FunctionComponent, ReactElement } from "react";
import { getCreatedTasks } from "../api/manage/view-created-tasks";
import { getAssignedTasks } from "../api/me/view-assigned-tasks";
import { Task } from "../api/type/task";

export interface ListTasksInterface {
    opertation: string;
}

export const ListTasks: FunctionComponent<ListTasksInterface> = (
    props: ListTasksInterface 
): ReactElement => {

    const {
        opertation,
    } = props;

    const { getAccessToken } = useAuthContext();
    const [tasks, setTasks] = useState<Task[]>([]);

    const manageEndpoint = window.config.manageServiceBaseUrl;
    const meEndpoint = window.config.meServiceBaseUrl;

    useEffect(() => {
        
        async function listTasks(operation: string) {
            const accessToken = await getAccessToken();
            if (operation === "ListCreatedTasks") {
                const response = await getCreatedTasks(manageEndpoint, accessToken);
                setTasks(response.data)
            } else if (operation === "ListAssignedTasks") {
                const response = await getAssignedTasks(meEndpoint, accessToken);
                setTasks(response.data);
            }   
        }
        
        listTasks(opertation);
    }, [opertation]);

    return (
        <TableContainer component={Paper}>
            <Table sx={{ minWidth: 650 }} aria-label="simple table">
                <TableHead>
                <TableRow>
                    <TableCell>Title</TableCell>
                    <TableCell align="left">Description</TableCell>
                </TableRow>
                </TableHead>
                <TableBody>
                {tasks.map((row) => (
                    <TableRow
                    key={row.id}
                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                    >
                    <TableCell component="th" scope="row">
                        {row.title}
                    </TableCell>
                    <TableCell align="left">{row.description}</TableCell>
                    </TableRow>
                ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
};

