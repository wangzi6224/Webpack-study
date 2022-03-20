import React, {useState} from "react";
import ReactDOM from "react-dom";
import './index.less';
import img from '../../public/assets/images/logo_pc@2x.png'
import Hello from "../components/Hello";

console.log(img);

export const Helloworld = () => {
    const [MyText, setMyText] = useState(null);

    const loadComponent = () => {
        /**
         * 使用动态懒加载, 需要通过babel中的 @babel/plugin-syntax-dynamic-import 插件进行动态懒加载, import方法返回一个Promise
        * */
        /*import("../components/Text").then(res => {
            setMyText(res.default)
        })*/
    }

    return (
        <div className="container">
            Hello world
            <Hello/>
            {
                MyText && <MyText/>
            }
            <img
                // onClick={loadComponent}
                src={img}/>
            <p style={{color: "#110199"}}>124411</p>
        </div>
    )
}

ReactDOM.render(
    <Helloworld/>,
    document.getElementById('root')
)

