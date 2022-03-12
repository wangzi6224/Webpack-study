import React from "react";
import Index from "./search";
import ReactDOM from "react-dom";
import {Helloworld} from "../index/helloworld";

const Page = () => {
    return (
        <div>
            <Index/>
        </div>
    )
};

ReactDOM.render(
    <Page/>,
    document.getElementById('root')
)
