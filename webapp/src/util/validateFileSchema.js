import Papa from 'papaparse';

const validateFile = (file) => {
    return new Promise((resolve, reject) => {
        Papa.parse(file, {
            header: true,
            complete: (results) => {
                if (results.data.length === 0) {
                    resolve("The file is empty.");
                    return;
                }

                const expectedHeaders = [
                    "PK",
                    "SK",
                    "question",
                    "answer",
                    "option1",
                    "option2",
                    "option3",
                    "option4"
                ];

                const actualHeaders = Object.keys(results.data[0]);

                if (!expectedHeaders.every(header => actualHeaders.includes(header))) {
                    resolve("The file schema is invalid. The required headers are: question, answer, level/SK, category/PK, option1, option2, option3, option4");
                    return;
                }

                resolve(null);
            }
        });
    });
};

export const validateFileSchema = (file) => {
    return validateFile(file);
};
