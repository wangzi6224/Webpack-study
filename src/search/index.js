import React from "react";
import Index from "./search";
import ReactDOM from "react-dom";
import './index.less'
import {Helloworld} from "../index/helloworld";

const Page = () => {
    return (
        <div className="container">
            <Index/>
        </div>
    )
};

ReactDOM.render(
    <Page/>,
    document.getElementById('root')
)
