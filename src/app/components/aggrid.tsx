import React, { useMemo } from 'react';

import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import { AgGridReact } from 'ag-grid-react';

const CyclesGrid = () => {
    const columnDefs = useMemo(
        () => [
            { headerName: 'Cycle name', field: 'cycleName', cellRenderer: 'linkRenderer' },
            { headerName: 'Version', field: 'version' },
            { headerName: 'Participants', field: 'participants' },
            { headerName: 'Schedule start date', field: 'startDate' },
            { headerName: 'Schedule end date', field: 'endDate' },
            { headerName: 'Status', field: 'status' },
            {
                headerName: 'Actions',
                field: 'actions',
                cellRenderer: ({ value }) => <button onClick={() => alert(`Action on ${value}`)}>Edit</button>
            }
        ],
        []
    );

    const rowData = [
        {
            cycleName: '2025 Cycle 1',
            version: '0001',
            participants: '3,000',
            startDate: '06/09/2025',
            endDate: '06/20/2025',
            status: 'Active',
            actions: '2025 Cycle 1'
        }
    ];

    const defaultColDef = {
        sortable: true,
        filter: true,
        resizable: true
    };

    return (
        <div className='ag-theme-alpine' style={{ height: 300, width: '100%' }}>
            <AgGridReact rowData={rowData} columnDefs={columnDefs} defaultColDef={defaultColDef} />
        </div>
    );
};

export default CyclesGrid;
