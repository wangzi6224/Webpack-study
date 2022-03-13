import React from "react";
import ReactDOM from "react-dom";
import './index.less';
import img from './image/logo_pc@2x.png'
import Hello from "../components/Hello";

export const Helloworld = () => {
    debugger
    return (
        <div className="container">
            Hello world
            <Hello/>
            <img src={img} alt=""/>
            <p style={{color: "#110199"}}>124411</p>
        </div>
    )
}

ReactDOM.render(
    <Helloworld/>,
    document.getElementById('root')
)

