const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 100;

export const getPagination = (query = {}) => {
    const page = Math.max(
        Number.parseInt(query.page, 10) || DEFAULT_PAGE,
        1
    );

    const limit = Math.min(
        Math.max(
            Number.parseInt(query.limit, 10) || DEFAULT_LIMIT,
            1
        ),
        MAX_LIMIT
    );

    return {
        page,
        limit,
        skip: (page - 1) * limit,
    };
};

export const buildPaginationResponse = ({
    data,
    totalDocuments,
    page,
    limit,
}) => {
    const totalPages = Math.ceil(totalDocuments / limit);

    return {
        data,
        pagination: {
            page,
            limit,
            totalDocuments,
            totalPages,
            hasNextPage: page < totalPages,
            hasPreviousPage: page > 1,
        },
    };
};