import { useParams } from "react-router-dom";

const JournalDetail = () => {
  const { id } = useParams<{ id: string }>();

  return (
    <div>
      <h1>Journal Detail</h1>
      <p>Journal ID: {id}</p>

      <article>
        <p>Full journal content will appear here</p>
      </article>
    </div>
  );
};

export default JournalDetail;
