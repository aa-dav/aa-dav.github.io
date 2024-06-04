<?php

class DataBaseBinder
{
    private $stmt;
    private $args;
    private $result;
    
    private function refValues( $arr )
    {
        $refs = array();
        foreach($arr as $key => $value)
            $refs[$key] = &$arr[$key];
        return $refs;
    }
    public function __construct( $stmt )
    {
        $this->stmt = $stmt;
        $this->args = array();
        $this->args[ 0 ] = "";
    }
    public function i( $val )
    {
        $this->args[ 0 ] .= "i";
        $this->args[] = $val;
        return $this;
    }
    public function s( $val )
    {
        $this->args[ 0 ] .= "s";
        $this->args[] = $val;
        return $this;
    }
    public function d( $val )
    {
        $this->args[ 0 ] .= "d";
        $this->args[] = $val;
        return $this;
    }
    public function query()
    {
        if ( count( $this->args ) > 1 )
        {
            call_user_func_array( array( $this->stmt, 'bind_param' ),
                                    $this->refValues( $this->args ) );
        }
        if ( !$this->stmt->execute() )
            die( 'db error (exec): ' . $this->stmt->error );
        if ( $this->stmt->errno )
            die( 'db error (exec): ' . $this->stmt->error );
            
        $this->result = array();
        $parameters = array();
        $meta = $this->stmt->result_metadata();
        while ( $field = $meta->fetch_field() ) 
        {
            $this->result[ $field->name ] = "";
            $parameters[] = &$this->result[ $field->name ];
        } 
        call_user_func_array( array( $this->stmt, 'bind_result' ), 
            $this->refValues( $parameters ) );
        return $this;
    }
    public function fetch()
    {
        if ( $this->stmt->fetch() )
            return $this->result;
        else
            return false;
    }
    public function exec()
    {
        call_user_func_array( array( $this->stmt, 'bind_param' ),
                                $this->refValues( $this->args ) );
        if ( !$this->stmt->execute() )
            die( 'db error (exec): ' . $this->stmt->error );
        if ( $this->stmt->errno )
            die( 'db error (exec): ' . $this->stmt->error );
        $res = $this->stmt->affected_rows;
        $this->stmt->close();
        return $res;
    }
}

$db = new mysqli( DB_HOST, DB_USER, DB_PASSWORD, DB_NAME );
if ( $db === false )
    die( "db error (1)" );
if ( $db->connect_errno )
    die( "db error (2) " . $db->connect_error );

function db_prepare( $query )
{
    global $db;
    $stmt = $db->prepare( $query );
    if ( $stmt === false )
        die( 'db error: ' . $db->error );
    $res = new DataBaseBinder( $stmt );
    return $res;
}

?>