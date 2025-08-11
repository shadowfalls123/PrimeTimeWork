import React, { useState } from 'react';
import Papa from 'papaparse';

const expectedCSVFormat = [
    { header: 'Question', key: 'question' },
    { header: 'Option A', key: 'optionA' },
    { header: 'Option B', key: 'optionB' },
    { header: 'Option C', key: 'optionC' },
    { header: 'Option D', key: 'optionD' },
    { header: 'Answer', key: 'answer' },
];

const validateCSVFormat = (headers, expectedFormat) => {
    for (let i = 0; i < headers.length; i++) {
        if (headers[i] !== expectedFormat[i].header) {
            return false;
        }
    }
    return true;
};

const ValidateFileSchema = () => {
    //#PROD logger.log("In Validate File Schema function 1 ");
    const [error, setError] = useState(null);

    //#PROD logger.log("In Validate File Schema function 2 ");

    const handleFileUpload = (event) => {
        const file = event.target.files[0];

        //#PROD logger.log("In Validate File Schema function 3 ");

        Papa.parse(file, {
            header: true,
            complete: (results) => {
                const headers = Object.keys(results.data[0]);
                //#PROD logger.log("In Validate File Schema function 4 ");

                if (!validateCSVFormat(headers, expectedCSVFormat)) {
                    setError('The CSV file does not conform to the expected format.');
                }
            },
        });
    };

    return (
        <div>
            {error && <div>{error}</div>}
            <input type="file" onChange={handleFileUpload} />
        </div>
    );
};

export default ValidateFileSchema;
