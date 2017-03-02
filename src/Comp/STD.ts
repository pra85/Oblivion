import {Environment} from "../Env";
import {IO} from "../IO";
import {Errors} from "../Errors";
import {Strings} from "./Strings";
import {Lists} from "./List";
import {Maps} from "./Maps";
/**
 * Created by Josh on 2/13/17.
 */

//AST functions that implement standard library
export namespace STD {
    //produces a callable Oblivion function
    export let func = (env:Environment.Env, args:any[]) => {
        let paramList = env.callLib(env, args[0].node, args[0].args);
        let funcBody = args[1].args;
        return (env:Environment.Env, args:any[]) => {
            //functionally scoped environment
            let funcEnv = env.createChild();
            if(args.length !== paramList.length) throw `Argument Error, expected ${paramList.length} args but got ${args.length}`;
            for(let i=0;i<paramList.length;i++){
                //binds called arguments to new Env
                funcEnv.set(paramList[i], funcEnv.callLib(funcEnv, args[i].node, args[i].args));
            }
            //calls all statements in body
            for(let j=0;j<funcBody.length;j++){
                funcEnv.callLib(funcEnv, funcBody[j].node, funcBody[j].args)
            }
            return funcEnv.getReturnValue();
        };

    };
    //creates a generator object
    export let generator = (env:Environment.Env, args:any[]) => {
        let defBody = args[0].args;
        let genBody = args[1].args;
        let genEnv = env.createChild();
        //runs the def body only once, to set up generator
        for(let i=0;i<defBody.length;i++){
            genEnv.callLib(genEnv, defBody[i].node, defBody[i].args);
        }
        return (env:Environment.Env, args:any[]) => {
            if(args.length !== 0) throw new Errors.ArgumentError(args.length, 0);
            //calls all statements in the generator body
            for(let j=0;j<genBody.length;j++){
                genEnv.callLib(genEnv, genBody[j].node, genBody[j].args);
            }
            //This is preserved between generator calls, but functions the same as a return
            return genEnv.getReturnValue();
        };

    };

    //handles a process, no parameter bodies of statemnts evaluated in the same scope
    export let process = (env:Environment.Env, args:any[]) => {
        let procBody = args[0].args;
        return (env:Environment.Env, args:any[]) => {
            if(args.length !== 0) throw new Errors.ArgumentError(args.length, 0);
            //calls all statements in the procBody
            for(let j=0;j<procBody.length;j++){
                env.callLib(env, procBody[j].node, procBody[j].args);
            }
        };

    };

    //handles variable assignment
    export let assign = (env:Environment.Env, args:any[]) => {
        env.set(env.callLib(env,args[0].node, args[0].args), env.callLib(env,args[1].node, args[1].args))
    };
    //handles Word rule, which retrieves variables
    export let wordVar = (env:Environment.Env, args:any[]) => {
        if(env.contains(args[0])) return env.get(args[0]);
        else return args[0];
    };

    //facilitates return function
    export let _return = (env:Environment.Env, args:any[]) => {
        if(args.length === 1) env.setReturnValue(env.callLib(env, args[0].node, args[0].args));
    };


    //handles parameters for a function
    export let params = (env:Environment.Env, args:any[]) => {
        for(let i=0;i<args.length;i++){
            args[i] = env.callLib(env, args[i].node, args[i].args);
        }
        return args;
    };
    //processes name nodes
    export let name = (env:Environment.Env, args:any[]) => {
        return args[0];
    };

    export let print = (env:Environment.Env, args:any[]) => {
        for(let i=0;i<args.length;i++){
            let printed = env.callLib(env, args[i].node, args[i].args);
            if(typeof printed === 'object') IO.pushOut(printed.strFormat());
            else IO.pushOut(printed);
        }
    };

    export let add = (env:Environment.Env, args:any[]) => {
        if(args.length === 0) return 0;
        let reduc = env.callLib(env, args[0].node, args[0].args);
        for(let i=1;i<args.length;i++){
            reduc += env.callLib(env, args[i].node, args[i].args);
        }
        return reduc;
    };

    export let sub = (env:Environment.Env, args:any[]) => {
        if(args.length === 0) return 0;
        let reduc = env.callLib(env, args[0].node, args[0].args);
        for(let i=1;i<args.length;i++){
            reduc -= env.callLib(env, args[i].node, args[i].args);
        }
        return reduc;
    };

    export let mul = (env:Environment.Env, args:any[]) => {
        if(args.length === 0) return 0;
        let reduc = env.callLib(env, args[0].node, args[0].args);
        for(let i=1;i<args.length;i++){
            reduc *= env.callLib(env, args[i].node, args[i].args);
        }
        return reduc;
    };

    export let div = (env:Environment.Env, args:any[]) => {
        if(args.length === 0) return 0;
        let reduc = env.callLib(env, args[0].node, args[0].args);
        for(let i=1;i<args.length;i++){
            reduc /= env.callLib(env, args[i].node, args[i].args);
        }
        return reduc;
    };

    export let rem = (env:Environment.Env, args:any[]) => {
        if(args.length === 0) return 0;
        let reduc = env.callLib(env, args[0].node, args[0].args);
        for(let i=1;i<args.length;i++){
            reduc %= env.callLib(env, args[i].node, args[i].args);
        }
        return reduc;
    };

    export let c_number = (env:Environment.Env, args:any[]) => {
        return Number(args[0]);
    };

    //handles bool nodes
    export let c_bool = (env:Environment.Env, args:any[]) => {
        return args[0];
    };

    export let c_null = (env:Environment.Env, args:any[]) => {
        return null;
    };

    //eq logical op functions -------------
    export let eq = (env:Environment.Env, args:any[]) => {
        if(args.length !== 2) throw new Errors.ArgumentError(args.length, 2);
        return env.callLib(env, args[0].node, args[0].args) === env.callLib(env, args[1].node, args[1].args);
    };


    export let ne = (env:Environment.Env, args:any[]) => {
        if(args.length !== 2) throw new Errors.ArgumentError(args.length, 2);
        return env.callLib(env, args[0].node, args[0].args) !== env.callLib(env, args[1].node, args[1].args);
    };

    //only numbers can be compared with <, <=, >=, and >
    export let lt = (env:Environment.Env, args:any[]) => {
        if(args.length !== 2) throw new Errors.ArgumentError(args.length, 2);
        let left = env.callLib(env, args[0].node, args[0].args);
        let right = env.callLib(env, args[1].node, args[1].args);
        if(typeof left !== 'number' || typeof right !== 'number') throw new Errors.TypeError('number', `${typeof left} and ${typeof right}`);
        return left < right;
    };

    export let gt = (env:Environment.Env, args:any[]) => {
        if(args.length !== 2) throw new Errors.ArgumentError(args.length, 2);
        let left = env.callLib(env, args[0].node, args[0].args);
        let right = env.callLib(env, args[1].node, args[1].args);
        if(typeof left !== 'number' || typeof right !== 'number') throw new Errors.TypeError('number', `${typeof left} and ${typeof right}`);
        return left > right;
    };

    export let le = (env:Environment.Env, args:any[]) => {
        if(args.length !== 2) throw new Errors.ArgumentError(args.length, 2);
        let left = env.callLib(env, args[0].node, args[0].args);
        let right = env.callLib(env, args[1].node, args[1].args);
        if(typeof left !== 'number' || typeof right !== 'number') throw new Errors.TypeError('number', `${typeof left} and ${typeof right}`);
        return left <= right;
    };

    export let ge = (env:Environment.Env, args:any[]) => {
        if(args.length !== 2) throw new Errors.ArgumentError(args.length, 2);
        let left = env.callLib(env, args[0].node, args[0].args);
        let right = env.callLib(env, args[1].node, args[1].args);
        if(typeof left !== 'number' || typeof right !== 'number') throw new Errors.TypeError('number', `${typeof left} and ${typeof right}`);
        return left >= right;
    };

    //comparison that works on lists and maps
    export let same = (env:Environment.Env, args:any[]) => {
        if(args.length !== 2) throw new Errors.ArgumentError(args.length, 2);
        return JSON.stringify(env.callLib(env, args[0].node, args[0].args)) === JSON.stringify(env.callLib(env, args[1].node, args[1].args));
    };

    /*Conditional StdLib funcs*/

    export let _if = (env:Environment.Env, args:any[]) => {
        if(args.length < 2) throw new Errors.ArgumentError(args.length, 2);
        let cond = env.callLib(env, args[0].node, args[0].args);
        //if condition is true, only executes first statement
        if(cond){
            //calls if function is present in if statemnt
            let statement = env.callLib(env, args[1].node, args[1].args);
            if(typeof statement === 'function') statement(env, []);
        }
        //If condition is false, executes the remaining statements after the first.
        else if(args.length > 2) {
            for(let i=2;i<args.length;i++){
                let state = env.callLib(env, args[i].node, args[i].args);
                if(typeof state === 'function') state(env, []);
            }
        }
    };

    export let loop = (env:Environment.Env, args:any[]) => {
        //must have at least a condition and statement/argument
        if(args.length < 2) throw new Errors.ArgumentError(args.length, 2);
        while(env.callLib(env, args[0].node, args[0].args)){
            for(let i=1;i<args.length;i++){
                //treats function types genrated from AST as callable blocks
                let state = env.callLib(env, args[i].node, args[i].args);
                if(typeof state === 'function') state(env, []);
            }
        }
    };
    //repeat function useful for drawing and looping
    //only accepts 2 arguments
    export let repeat = (env:Environment.Env, args:any[]) => {
        if(args.length !== 2) throw new Error(`ArgumentError: Expected 2 arguments but got ${args.length}`);
        let times = env.callLib(env, args[0].node, args[0].args);
        let proc = env.callLib(env, args[1].node, args[1].args);
        while(times--){
            proc(env, []);
        }
    };

    export let attribute = (env:Environment.Env, args:any[]) => {
        if(args.length !== 2) throw new Errors.ArgumentError(args.length, 2);
        let obj = env.get(env.callLib(env, args[0].node, args[0].args));
        let index = env.callLib(env, args[1].node, args[1].args);
        if(typeof obj === 'object' && obj !== null) {
            return obj.getItem(index); //collection interface
        }
        else throw new Errors.TypeError('Collection', typeof obj);
    };

    //handles any forms of a.b()
    export let methodCall = (env:Environment.Env, args:any[]) => {
        let method = env.callLib(env, args[0].node, args[0].args);
        if(typeof method !== 'function') throw new Errors.TypeError('callable', typeof args[0]);
        return method(env, args.slice(1));
    };

    export let attrAssign = (env:Environment.Env, args:any[]) => {
        let obj = env.get(args[0].args[0].args[0]);
        let key = env.callLib(env, args[0].args[1].node, args[0].args[1].args);
        obj.setItem(key, env.callLib(env, args[1].node, args[1].args));
    };

    export let c_string = (env:Environment.Env, args:any[]) => {
        return new Strings.OblString(args[0]);
    };

    //creates new list object
    export let c_list = (env:Environment.Env, args:any[]) => {
        for(let i=0;i<args.length;i++){
            args[i] = env.callLib(env, args[i].node, args[i].args);
        }
        return new Lists.OblList(args);
    };

    //creates new map object
    export let c_map = (env:Environment.Env, args:any[]) => {
        let map = new Maps.OblMap();
        for(let pair of args){
            map.setItem(env.callLib(env, pair.args[0].node, pair.args[0].args), env.callLib(env, pair.args[1].node, pair.args[1].args))
        }
        return map;
    };

    //produces lists in a range
    export let range = (env:Environment.Env, args:any[]) => {
        switch(args.length){
            case 0:
                return new Lists.OblList();
            case 1:
                var lst = [];
                let limit = env.callLib(env, args[0].node, args[0].args);
                if(typeof limit !== 'number') throw new Error(`TypeError: Got type ${typeof limit} but needs number.`);
                for(let i=0;i<limit;i++) lst.push(i);
                return new Lists.OblList(lst);
            case 2:
                var lst = [];
                let start = env.callLib(env, args[0].node, args[0].args);
                let end = env.callLib(env, args[1].node, args[1].args);
                if(typeof start !== 'number' || typeof end !== 'number') throw new Error(`TypeError: Needs type number.`);
                for(let i=start;i<end;i++) lst.push(i);
                return new Lists.OblList(lst);
        }
    };

    export let type = (env:Environment.Env, args:any[]):string => {
        if(args.length !== 1) throw new Error(`ArgumentError: !type() takes one argument but got ${args.length}`);
        let obj = env.callLib(env, args[0].node, args[0].args);
        if(typeof obj !== 'object') return typeof obj;
        else switch(obj.constructor.name){
            case 'OblList': return 'List';
            case 'OblString': return 'String';
            case 'OblMap': return 'Map';
        }
    };
}