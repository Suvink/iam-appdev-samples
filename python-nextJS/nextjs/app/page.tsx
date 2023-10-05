/* eslint-disable react-hooks/exhaustive-deps */
"use client"
import { useSession, signIn, signOut } from "next-auth/react"
import { useEffect, useState } from "react";
import Popup from 'reactjs-popup';
import 'reactjs-popup/dist/index.css';
import axios from "axios";

export default function Component() {
    const { data, status }: any = useSession();
    const [items , setItems] = useState<any[]>([])
    const [open, setOpen] = useState(false)
    const [isLoading, setLoading] = useState(false)
    const [isAdmin, setAdmin] = useState(false)
    const [candidat, setCandidat] = useState({
        name: ""
      });


    useEffect(() => {
        console.log("Logging in...", status);

        if (status === 'authenticated') {
            console.log("Authenticated ...", status);
            console.log("User : ", data)
            const scopes = data?.user?.scope;
            if (scopes && scopes.includes("urn:senthalan:backendservicepythonitems:add_item")) {
                setAdmin(true);
            }
            getItems();
        }
    }, [status])

    const getItems = async () => {
        try {
          setLoading(true)
            const response = await axios.get("/api/items");
            console.log("items : ", response.data);
            // items = response.data;
            setItems(response.data)
            setLoading(false)
        } catch (error) {
          setLoading(false)
        }
    }

    const openAddItem = () => {
        if (data?.user?.current_acr === "acr1") {
            console.log("Stepping up");
            signIn("asgardeo", {}, {acr_values : "acr2"})
        } else {
            setOpen(true)
        }
    }

    const onSubmit = async (e: { preventDefault: () => void; }) => {
        e.preventDefault();
        if (candidat.name === "")
          return alert("Item can't be null");
    
        await fetch("/api/items", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(candidat),
            });
            setItems([...items, candidat]);
            setOpen(false);
    };

    const invokeSignOut = async () => {
        let idpLogoutUrl: string;
        await fetch("/api/getLogout", {
            method: "GET",
        }).then((res) => res.json().then((data) => {idpLogoutUrl = data.location;}));

        signOut()
            .then(
                () => window.location.assign(idpLogoutUrl)
            );
    }

    const invokeSignUp = async () => {
        
        await fetch("/api/getSignUp", {
            method: "GET",
        }).then((res) => res.json().then((data) => {window.location.assign(data.location)}));
    }

    return (
      <div>

        {
            (status === 'unauthenticated') &&
            <div className="flex flex-col items-center justify-center h-screen">
                <h1 className="text-3xl font-bold mb-4">You are not logged in!</h1>
                <button
                    className="bg-black text-white text-sm font-medium p-2 rounded "
                    onClick={() => signIn("asgardeo", {}, {acr_values : "acr1"})}
                >
                    <>Sign In</>
                </button> 
                <br/>
                <br/>
                <button
                    className="bg-black text-white text-sm font-medium p-2 rounded "
                    onClick={invokeSignUp}
                >
                    <>Sign Up</>
                </button> 
            </div>
        }
        {
            (status === 'authenticated') &&
            <div>
                <h3>Welcome {data.user.email}</h3>
                <button className="bg-black text-white text-sm font-medium p-2 rounded "onClick={invokeSignOut}>
                    Sign Out
                </button>

                <h1 style={{ textAlign: 'center', marginBottom: '20px' }}>Item List</h1>
                
                {(!data) && <p>No Items</p>}
                
                {(isAdmin) && (
                    <>
                        <button
                            className="bg-black text-white text-sm font-medium p-2 rounded "
                            onClick={openAddItem}
                        >
                            <>Add Item</>
                        </button>
                    <Popup open={open} 
                        position="right center">
                        <form
                            onSubmit={onSubmit}
                            className="w-1/3 justify-center border-2 flex flex-col gap-4 m-4 p-2">
                            <input
                            className="border-2 border-gray-200  p-2"
                            onChange={(e) => setCandidat({name : e.target.value})} 
                            ></input>
                            <button
                            className="bg-black text-white text-sm font-medium p-2 rounded "
                            type="submit"
                            >
                            <>Add</>
                            </button>
                        </form>
                    </Popup>
                </>
                )}

                <ul style={{ listStyle: 'none', paddingLeft: '0' }}>
                    {items.map((item) => (
                    <li 
                    key={item.name}
                    style={{
                        borderColor: 'rgb(44 54 99)',
                        padding: '10px',
                        marginBottom: '10px',
                        borderRadius: '5px',
                        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                    }}>
                        {item.name}
                        </li>
                    ))}
                </ul>
            </div>
        }
      </div>
    )
}