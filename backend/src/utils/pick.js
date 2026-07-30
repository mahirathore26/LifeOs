const pick = (object, allowedFields) => {
    return Object.keys(object)
        .filter((key) => allowedFields.includes(key))
        .reduce((result, key) => {
            result[key] = object[key];
            return result;
        }, {});
};

export default pick;