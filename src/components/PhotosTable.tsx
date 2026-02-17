import { Table } from "./pricing/Table";
import { PhotoRow } from "./PhotoRow";
import { PhotoData } from "../data/mock-photos";

interface PhotosTableProps {
    photos: PhotoData[];
}

export function PhotosTable({ photos }: PhotosTableProps) {
    return (
        <Table>
            <Table.Header>
                <tr>
                    <Table.Column isBlack>File Name</Table.Column>
                    <Table.Column>Source</Table.Column>
                    <Table.Column>Created By</Table.Column>
                    <Table.Column>Size</Table.Column>
                    <Table.Column>Downloaded By</Table.Column>
                    <Table.Column>Status</Table.Column>
                    <Table.Column align="right">Date & Time</Table.Column>
                    <Table.Column align="right">Actions</Table.Column>
                </tr>
            </Table.Header>
            <Table.Body>
                {photos.map((photo) => (
                    <PhotoRow key={photo.id} photo={photo} />
                ))}
            </Table.Body>
        </Table>
    );
}
