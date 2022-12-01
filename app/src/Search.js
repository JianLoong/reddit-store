import React, { useEffect, useState } from 'react';
import Select from 'react-select';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Submission from './Submission';

const noOfPost = [
    { value: '10', label: '10' },
    { value: '20', label: '20' },
    { value: '50', label: '50' },
];

const sortOrder = [
    { value: "hot", label: "hot" },
    { value: "new", label: "new" },
]

const fetchSubmission = (index) => {
    

    fetch("https://jianliew.me/reddit-store/api/submissions/" + index + ".json")
        .then(response => {
            if (response.ok)
                return response.json();
            throw new Error("Something went wrong");
        })
        .then(data => {
           
            const json = data;
            let submission = json;

            console.log(json);
   
           
        })
        .catch(err => {
   
        });
}


const defaultStartUTC = () => {
    const startOfToDay = new Date();
    startOfToDay.setHours(0, 0, 0, 0);
    const startUTC = startOfToDay.getTime() / 1000;
    return startUTC;
}

const defaultEndUTC = () => {

    const endOfToday = new Date();
    endOfToday.setDate(endOfToday.getDate() + 1);
    endOfToday.setHours(0, 0, 0, 0);
    const endUTC = endOfToday.getTime() / 1000;
    return endUTC;
}

const sortIndexes = (results, startUTC, endUTC, noOfPost, order) => {

    const sorted = [];

    for(let result of results){
       
        const utc = result["created_utc"];
            if (utc > startUTC)
                if (utc < endUTC)
                    sorted.push(result);
    } 
    
    if (sorted.length === 0) {
        throw new Error("No entries found.")
    }

    if (order === "hot")
        sorted.sort((a, b) => a.score - b.score);
    else
        sorted.sort((a, b) => b.created_utc - a.created_utc);

    const sliced = sorted.slice(0, noOfPost);

    let indexes = [];
    indexes.push(...sliced.map(e => e.id));

    return indexes;
}

export default function Search() {

    const [selectedNoOfPosts, setSelectedNoOfPosts] = useState(null);
    const [selectedSortOrder, setSelectedSortOrder] = useState(null);
    const [startDate, setStartDate] = useState(new Date());
    const [submissions, setSubmissions] = useState();

    useEffect(()=>{

        fetch("https://jianliew.me/reddit-store/api/indexes/indexes.json?" + Math.random())
        .then(response => {
            if (response.ok)
                return response.json();
            throw new Error("Something went wrong");
        })
        .then(result => {

            const startOfDay = new Date(startDate);
            const endOfDay = new Date(startDate);
            startOfDay.setHours(0, 0, 0, 0);
            endOfDay.setHours(24, 0, 0, 0);
        
            const startUTC = startOfDay.getTime() / 1000;
            const endUTC = endOfDay.getTime() / 1000;

            const indexes = sortIndexes(result, startUTC || defaultStartUTC(), endUTC || defaultEndUTC(), selectedNoOfPosts?.value || 10, selectedSortOrder?.value || "hot");

            //console.log(indexes);

            setSubmissions(JSON.stringify(indexes));

            for(let i = 0; i < indexes.length; i++){
                console.log(indexes[i])
                fetchSubmission(indexes[i]);
            }
            
        })
        .then(result => {
    
        })
        .catch(err => {
            console.log(err);
        });    

       }, [selectedNoOfPosts, selectedSortOrder, startDate]);

    return (
        <div className="dateSelect row">
            <div className="col-md-4">
                <Select
                    defaultValue={noOfPost[0]}
                    onChange={setSelectedNoOfPosts}
                    options={noOfPost}
                />
            </div>
            <div className="col-md-4">
                <Select
                    defaultValue={sortOrder[0]}
                    onChange={setSelectedSortOrder}
                    options={sortOrder}
                />
            </div>
            <div className="col-md-4">
                <DatePicker
                    defaultValue={new Date()}
                    className='form-control'
                    dateFormat="dd/MM/yyyy"
                    minDate={new Date(Date.UTC(2022, 10, 1))}
                    maxDate={new Date()}
                    selected={startDate}
                    onChange={(date) => setStartDate(date)}
                />
            </div>

            <div>{submissions}</div>
            <div><Submission /></div>

        </div>
    );
}