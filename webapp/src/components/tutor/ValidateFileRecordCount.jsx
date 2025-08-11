import React, { useState } from 'react';
import Papa from 'papaparse';

const validateCSVRecordCount = (file, maxRecords, setError) => {
    Papa.parse(file, {
        complete: (results) => {
            //#PROD logger.log("In ValidateRecordCount function 5 ");

            if (results.data.length > maxRecords) {
                setError(`The number of records in the CSV file exceeds the limit of ${maxRecords}.`);
            }
        },
    });
};

const ValidateFileRecordCount = () => {
    //#PROD logger.log("In ValidateRecordCount function 1 ");
    const [error, setError] = useState(null);
    //#PROD logger.log("In ValidateRecordCount function 1.1 ");

    const handleFileUpload = (event) => {
        //#PROD logger.log("In ValidateRecordCount function 2 ");

        const file = event.target.files[0];
        const maxRecords = 5; // example maximum record limit
        //#PROD logger.log("In ValidateRecordCount function 3 ");

        validateCSVRecordCount(file, maxRecords, setError);
    };

    return (
        <div>
            {error && <div>{error}</div>}
            <input type="file" onChange={handleFileUpload} />
        </div>
    );
};

export default ValidateFileRecordCount;
