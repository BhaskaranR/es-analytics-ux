import React, { useMemo, useState } from 'react';

import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import { AgGridReact } from 'ag-grid-react';

const CyclesGrid = () => {
    const [rowData, setRowData] = useState([
        {
            id: 1,
            cycleName: '2025 Cycle 1',
            version: '0001',
            participants: '3,000',
            startDate: '06/09/2025',
            endDate: '06/20/2025',
            status: 'Active'
        },
        {
            id: 2,
            cycleName: 'Clone-2025 Cycle 1',
            version: '0001-2',
            participants: '0',
            startDate: '06/09/2025',
            endDate: '06/20/2025',
            status: 'Inactive'
        }
    ]);

    const [openMenuRow, setOpenMenuRow] = useState<number | null>(null);

    const cloneRow = (data) => {
        const newRow = {
            ...data,
            id: Date.now(),
            cycleName: `Clone-${data.cycleName}`,
            version: `${data.version}-2`,
            participants: '0',
            status: 'Inactive'
        };
        setRowData((prev) => [...prev, newRow]);
    };

    const deleteRow = (id: number) => {
        setRowData((prev) => prev.filter((r) => r.id !== id));
    };

    const columnDefs = useMemo(
        () => [
            {
                headerName: 'Cycle name',
                field: 'cycleName',
                cellRenderer: (params) => <a href='#'>{params.value}</a>
            },
            { headerName: 'Version', field: 'version' },
            { headerName: 'Participants', field: 'participants' },
            { headerName: 'Schedule start date', field: 'startDate' },
            { headerName: 'Schedule end date', field: 'endDate' },
            { headerName: 'Status', field: 'status' },
            {
                headerName: 'Actions',
                field: 'actions',
                cellRenderer: (params) => {
                    const rowId = params.data.id;
                    const isOpen = openMenuRow === rowId;

                    return (
                        <div style={{ position: 'relative' }}>
                            <button
                                onClick={() => setOpenMenuRow((prev) => (prev === rowId ? null : rowId))}
                                style={{ background: 'transparent', border: 'none' }}>
                                <i className='hlx hlx-control-menu-overflow' />
                            </button>
                            {isOpen && (
                                <div
                                    style={{
                                        position: 'absolute',
                                        top: '100%',
                                        right: 0,
                                        background: '#fff',
                                        border: '1px solid #ccc',
                                        boxShadow: '0px 2px 8px rgba(0,0,0,0.15)',
                                        zIndex: 100,
                                        minWidth: 100
                                    }}>
                                    <div
                                        onClick={() => {
                                            cloneRow(params.data);
                                            setOpenMenuRow(null);
                                        }}
                                        style={{ padding: '8px 12px', cursor: 'pointer' }}>
                                        Clone
                                    </div>
                                    <div
                                        onClick={() => {
                                            deleteRow(params.data.id);
                                            setOpenMenuRow(null);
                                        }}
                                        style={{
                                            padding: '8px 12px',
                                            cursor: 'pointer',
                                            color: 'red'
                                        }}>
                                        Delete
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                }
            }
        ],
        [openMenuRow]
    );

    const defaultColDef = {
        sortable: true,
        filter: true,
        resizable: true
    };

    return (
        <div className='ag-theme-alpine' style={{ height: 300 }}>
            <AgGridReact
                rowData={rowData}
                columnDefs={columnDefs}
                defaultColDef={defaultColDef}
                suppressCellFocus
                domLayout='autoHeight'
                rowHeight={55}
            />
        </div>
    );
};

export default CyclesGrid;
